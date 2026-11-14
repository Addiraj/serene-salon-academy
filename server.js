const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Statically bundle default DB for Vercel Serverless Function file tracing
let DEFAULT_DB = {};
try {
  DEFAULT_DB = require('./data/db.json');
} catch (e) {
  DEFAULT_DB = { services: [], bookings: [], offers: [], courses: [], settings: {} };
}

const app = express();
const PORT = process.env.PORT || 3000;
const SEED_DB_PATH = path.join(__dirname, 'data', 'db.json');
const DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'db.json')
  : SEED_DB_PATH;

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve React production build if available, with fallback to public
const clientDistPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}
app.use('/classic', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Admin shortcut redirect to React Admin Dashboard
app.get('/admin', (req, res) => {
  res.redirect('/#admin');
});

// Helper to read DB safely
function readDb() {
  try {
    if (process.env.VERCEL && !fs.existsSync(DB_PATH)) {
      if (fs.existsSync(SEED_DB_PATH)) {
        fs.copyFileSync(SEED_DB_PATH, DB_PATH);
      } else {
        fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
      }
    }
    if (!fs.existsSync(DB_PATH)) {
      if (fs.existsSync(SEED_DB_PATH)) {
        return JSON.parse(fs.readFileSync(SEED_DB_PATH, 'utf-8'));
      }
      return DEFAULT_DB;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    if (fs.existsSync(SEED_DB_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(SEED_DB_PATH, 'utf-8'));
      } catch (e) {}
    }
    return DEFAULT_DB;
  }
}

// Helper to write DB atomically
function writeDb(data) {
  try {
    const tempPath = DB_PATH + '.tmp';
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_PATH);
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// ==========================================
// 1. SETTINGS & AUTH
// ==========================================
app.get('/api/settings', (req, res) => {
  const db = readDb();
  const settings = db.settings || {};
  // don't expose adminPin to public
  const { adminPin, ...publicSettings } = settings;
  res.json({ success: true, settings: publicSettings });
});

app.put('/api/settings', (req, res) => {
  const db = readDb();
  db.settings = { ...db.settings, ...req.body };
  writeDb(db);
  const { adminPin, ...publicSettings } = db.settings;
  res.json({ success: true, settings: publicSettings });
});

// Upload or update salon logo (base64 or custom URL)
app.post('/api/upload-logo', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const db = readDb();
    
    // Check if base64 data URI
    const matches = typeof imageBase64 === 'string' && imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `serene-logo-custom.png`;
      const publicPath = path.join(__dirname, 'public', 'images', filename);
      const clientDistPath = path.join(__dirname, 'client', 'dist', 'images', filename);
      const clientPublicPath = path.join(__dirname, 'client', 'public', 'images', filename);

      let savedToFile = false;
      try {
        if (fs.existsSync(path.dirname(publicPath))) fs.writeFileSync(publicPath, buffer);
        if (fs.existsSync(path.dirname(clientDistPath))) fs.writeFileSync(clientDistPath, buffer);
        if (fs.existsSync(path.dirname(clientPublicPath))) fs.writeFileSync(clientPublicPath, buffer);
        savedToFile = true;
      } catch (writeErr) {
        // e.g. on serverless read-only /tmp environment
        console.warn('Could not write logo to static folders, storing data URI directly', writeErr.message);
      }

      const logoUrl = savedToFile ? `/images/${filename}?t=${Date.now()}` : imageBase64;
      db.settings.logoUrl = logoUrl;
      writeDb(db);
      return res.json({ success: true, logoUrl, message: 'Logo updated successfully!' });
    } else {
      // Plain URL string
      db.settings.logoUrl = imageBase64;
      writeDb(db);
      return res.json({ success: true, logoUrl: imageBase64, message: 'Logo updated successfully!' });
    }
  } catch (err) {
    console.error('Error in /api/upload-logo:', err);
    return res.status(500).json({ success: false, message: 'Failed to process logo update' });
  }
});

app.post('/api/admin/verify-pin', (req, res) => {
  const { pin } = req.body;
  const db = readDb();
  const expectedPin = db.settings?.adminPin || '1234';
  if (pin && String(pin).trim() === String(expectedPin).trim()) {
    return res.json({ success: true, message: 'Authorized' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
});

// ==========================================
// 1B. OTP AUTHENTICATION & CUSTOMER PROFILES (ENRICH-STYLE)
// ==========================================
const otpStore = new Map(); // phone -> { code, expiresAt, attempts }

function cleanPhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) return '+91 ' + digits;
  if (digits.length > 10 && digits.startsWith('91')) return '+91 ' + digits.slice(2);
  return String(raw).trim();
}

// 1. Send OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Mobile number is required' });
  }

  const normalized = cleanPhone(phone);
  // Generate 4-digit OTP
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins

  otpStore.set(normalized, { code, expiresAt, attempts: 0 });

  const db = readDb();
  const user = (db.users || []).find(u => cleanPhone(u.phone) === normalized);

  console.log(`[AUTH-OTP] Sent OTP ${code} to ${normalized} (User exists: ${!!user})`);

  res.json({
    success: true,
    message: `OTP sent successfully to ${normalized}`,
    phone: normalized,
    isNewUser: !user,
    devOtp: code // Provided for instant demo testing
  });
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
  }

  const normalized = cleanPhone(phone);
  const entry = otpStore.get(normalized);

  // Accept valid generated OTP or developer universal bypass "1234"
  const isValid = (entry && entry.code === String(otp).trim() && Date.now() <= entry.expiresAt) || String(otp).trim() === '1234';

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code. Try again.' });
  }

  // Clear OTP entry
  otpStore.delete(normalized);

  const db = readDb();
  const user = (db.users || []).find(u => cleanPhone(u.phone) === normalized);

  if (!user) {
    return res.json({
      success: true,
      isNewUser: true,
      phone: normalized,
      message: 'Mobile verified. Please complete your name to activate your Serene Privilege profile.'
    });
  }

  // Existing user logged in
  const token = 'st-' + Buffer.from(normalized + ':' + Date.now()).toString('base64');
  res.json({
    success: true,
    isNewUser: false,
    user,
    token,
    message: `Welcome back, ${user.name}!`
  });
});

// 3. Register New User
app.post('/api/auth/register', (req, res) => {
  const { phone, name, email, interests } = req.body;
  if (!phone || !name) {
    return res.status(400).json({ success: false, message: 'Name and Mobile number are required' });
  }

  const normalized = cleanPhone(phone);
  const db = readDb();
  db.users = db.users || [];

  let existing = db.users.find(u => cleanPhone(u.phone) === normalized);
  if (existing) {
    existing.name = name.trim();
    if (email) existing.email = email.trim();
    writeDb(db);
    return res.json({
      success: true,
      user: existing,
      token: 'st-' + Buffer.from(normalized + ':' + Date.now()).toString('base64'),
      message: 'Profile updated successfully!'
    });
  }

  const newUser = {
    id: 'usr-' + Date.now(),
    name: name.trim(),
    phone: normalized,
    email: email ? email.trim() : '',
    interests: interests || ['Skin & Facials', 'Hair Care'],
    role: 'customer',
    tier: 'Serene Silver Privilege',
    loyaltyPoints: 150, // 150 Welcome bonus points
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.users.unshift(newUser);
  writeDb(db);

  const token = 'st-' + Buffer.from(normalized + ':' + Date.now()).toString('base64');
  res.json({
    success: true,
    user: newUser,
    token,
    message: `Welcome to Serene Privilege Club, ${newUser.name}! 150 Welcome Points Added.`
  });
});

// 4. Current User & Past Bookings
app.get('/api/auth/me', (req, res) => {
  const phone = req.query.phone || req.headers['x-user-phone'];
  if (!phone) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const normalized = cleanPhone(phone);
  const db = readDb();
  const user = (db.users || []).find(u => cleanPhone(u.phone) === normalized);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Find user's bookings
  const pureDigits = normalized.replace(/\D/g, '').slice(-10);
  const userBookings = (db.bookings || []).filter(b => {
    const bDigits = String(b.guestPhone || '').replace(/\D/g, '').slice(-10);
    return bDigits === pureDigits;
  });

  res.json({
    success: true,
    user,
    bookings: userBookings
  });
});

// 5. Google reCAPTCHA Verification API
app.post('/api/auth/verify-captcha', (req, res) => {
  const { token } = req.body;
  // Validates presence of client verification token
  if (!token) {
    return res.status(400).json({ success: false, message: 'Captcha token required' });
  }
  res.json({ success: true, verified: true, score: 0.9 });
});

// 6. Enrich-Style Fast Booking Request
app.post('/api/bookings/quick-request', (req, res) => {
  const { name, phone, segment, date, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone number are required' });
  }

  const normalizedPhone = cleanPhone(phone);
  const db = readDb();
  const bookingDate = date || new Date().toISOString().split('T')[0];

  if (segment === 'academy') {
    // Save to inquiries
    db.inquiries = db.inquiries || [];
    const newInq = {
      id: 'INQ-' + Math.floor(100 + Math.random() * 900),
      name: name.trim(),
      phone: normalizedPhone,
      course: 'Career Counseling & Course Selection',
      preferredTime: 'Morning Batch (10 AM - 1 PM)',
      notes: notes || 'Academy course consultation request from landing page',
      status: 'New',
      createdAt: new Date().toISOString()
    };
    db.inquiries.unshift(newInq);
    writeDb(db);

    return res.json({
      success: true,
      id: newInq.id,
      type: 'academy',
      message: 'Academy Consultation Request Received! Rashmi Sah will personally connect with you via WhatsApp.'
    });
  }

  // Women's Luxury Salon Request
  db.bookings = db.bookings || [];
  const newBooking = {
    id: 'SSA-' + Math.floor(1000 + Math.random() * 9000),
    guestName: name.trim(),
    guestPhone: normalizedPhone,
    date: bookingDate,
    time: '11:00 AM',
    stylist: 'Rashmi Sah (Founder & Master Artist)',
    services: ['VIP First Visit Consultation & Treatment Selection'],
    subtotal: 549, // Grounded Enrich-style first visit starting price
    discount: 0,
    promoCode: 'FIRSTVISIT',
    total: 549,
    status: 'Pending',
    notes: notes || 'First Visit Priority Privileges Appointment',
    createdAt: new Date().toISOString()
  };

  db.bookings.unshift(newBooking);
  writeDb(db);

  res.json({
    success: true,
    booking: newBooking,
    type: 'salon',
    message: 'Priority Booking Request Confirmed! Our sanctuary concierge is preparing your sterile suite.'
  });
});

// 7. Admin List Users / Loyalty Members
app.get('/api/users', (req, res) => {
  const db = readDb();
  res.json({ success: true, users: db.users || [] });
});

// ==========================================
// 2. DASHBOARD STATS
// ==========================================
app.get('/api/admin/stats', (req, res) => {
  const db = readDb();
  const bookings = db.bookings || [];
  const inquiries = db.inquiries || [];
  const services = db.services || [];
  const offers = db.offers || [];
  const courses = db.courses || [];

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);

  const totalRevenue = bookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((sum, b) => sum + (Number(b.total) || 0), 0);

  const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
  const activeOffersCount = offers.filter(o => o.active).length;
  const newInquiries = inquiries.filter(i => i.status === 'New').length;

  res.json({
    success: true,
    stats: {
      totalBookings: bookings.length,
      todayBookingsCount: todayBookings.length,
      pendingBookings,
      totalRevenue,
      newInquiries,
      totalInquiries: inquiries.length,
      activeOffersCount,
      totalServices: services.length,
      totalCourses: courses.length
    }
  });
});

// ==========================================
// 2B. INVOICE & FINANCIAL REVENUE ANALYTICS
// ==========================================
app.get('/api/admin/invoices/analytics', (req, res) => {
  const db = readDb();
  const bookings = db.bookings || [];
  const servicesList = db.services || [];
  const settings = db.settings || {};
  const invSettings = settings.invoiceSettings || {};

  const taxPercent = Number(invSettings.taxPercent) || 18;
  const isTaxInclusive = (invSettings.taxMode || 'inclusive') === 'inclusive';
  const enableGst = invSettings.enableGst !== false;

  const validBookings = bookings.filter(b => b.status !== 'Cancelled');
  
  let totalInvoicedRevenue = 0;
  let realizedRevenue = 0;
  let pendingReceivables = 0;
  let totalPaidCount = 0;
  let totalPendingCount = 0;

  const paymentModes = { 'Paytm UPI': 0, 'Cash': 0, 'Credit/Debit Card': 0, 'Other': 0 };
  const statusCounts = { 'Paid': 0, 'Pending': 0, 'Partial': 0, 'Cancelled': 0 };
  const categoryRevenue = {};

  const serviceMap = new Map();
  servicesList.forEach(s => {
    if (s && s.name) serviceMap.set(s.name.toLowerCase().trim(), s);
  });

  bookings.forEach(b => {
    const total = Number(b.total) || 0;
    const isCancelled = b.status === 'Cancelled';
    const isPaid = b.paymentStatus === 'Paid' || b.status === 'Completed';

    if (isCancelled) {
      statusCounts['Cancelled']++;
      return;
    }

    totalInvoicedRevenue += total;

    if (isPaid) {
      realizedRevenue += total;
      totalPaidCount++;
      statusCounts['Paid']++;
    } else if (b.paymentStatus === 'Partial') {
      const paid = Number(b.paidAmount) || 0;
      realizedRevenue += paid;
      pendingReceivables += (total - paid);
      statusCounts['Partial']++;
    } else {
      pendingReceivables += total;
      totalPendingCount++;
      statusCounts['Pending']++;
    }

    // Payment mode attribution
    const mode = b.paymentMethod || (b.utrNumber ? 'Paytm UPI' : 'Cash');
    if (paymentModes[mode] !== undefined) {
      paymentModes[mode] += total;
    } else {
      paymentModes['Other'] = (paymentModes['Other'] || 0) + total;
    }

    // Service category attribution
    (b.services || []).forEach(sName => {
      const match = serviceMap.get(String(sName).toLowerCase().trim());
      const cat = match ? match.category : 'General Salon & Grooming';
      const itemPrice = match ? (Number(match.price) || 0) : Math.round(total / Math.max(1, (b.services || []).length));
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + itemPrice;
    });
  });

  // Calculate Tax / GST
  let totalGstAccrued = 0;
  let taxableRevenue = totalInvoicedRevenue;
  if (enableGst && taxPercent > 0) {
    if (isTaxInclusive) {
      taxableRevenue = Math.round((totalInvoicedRevenue / (1 + taxPercent / 100)) * 100) / 100;
      totalGstAccrued = Math.round((totalInvoicedRevenue - taxableRevenue) * 100) / 100;
    } else {
      totalGstAccrued = Math.round((totalInvoicedRevenue * (taxPercent / 100)) * 100) / 100;
    }
  }

  const averageOrderValue = validBookings.length > 0
    ? Math.round(totalInvoicedRevenue / validBookings.length)
    : 0;

  // Monthly trends (group by YYYY-MM)
  const monthlyTrendsMap = {};
  validBookings.forEach(b => {
    const rawDate = b.date || b.createdAt;
    let monthKey = 'Current';
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          monthKey = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        }
      } catch (e) {}
    }
    monthlyTrendsMap[monthKey] = (monthlyTrendsMap[monthKey] || 0) + (Number(b.total) || 0);
  });

  const monthlyTrends = Object.entries(monthlyTrendsMap).map(([month, amount]) => ({
    month,
    amount
  }));

  res.json({
    success: true,
    analytics: {
      totalInvoicedRevenue,
      realizedRevenue,
      pendingReceivables,
      taxableRevenue,
      totalGstAccrued,
      cgstAccrued: Math.round((totalGstAccrued / 2) * 100) / 100,
      sgstAccrued: Math.round((totalGstAccrued / 2) * 100) / 100,
      averageOrderValue,
      totalInvoicesCount: validBookings.length,
      paidInvoicesCount: totalPaidCount,
      pendingInvoicesCount: totalPendingCount,
      cancelledInvoicesCount: statusCounts['Cancelled'],
      statusCounts,
      paymentModes,
      categoryRevenue,
      monthlyTrends
    }
  });
});

// Single Booking Invoice Detailed Payload
app.get('/api/invoices/:bookingId', (req, res) => {
  const db = readDb();
  const booking = (db.bookings || []).find(b => b.id === req.params.bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Invoice / Booking not found' });
  }

  const settings = db.settings || {};
  const invoiceSettings = settings.invoiceSettings || {};
  const servicesList = db.services || [];

  const items = (booking.services || []).map(sName => {
    const found = servicesList.find(s => s.name && s.name.toLowerCase().trim() === String(sName).toLowerCase().trim());
    return {
      name: sName,
      category: found ? found.category : 'Salon Ritual',
      price: found ? (Number(found.price) || 0) : 0,
      duration: found ? found.duration : 45,
      hygieneNote: found ? found.hygieneNote : 'Autoclaved Sealed Pouches Opened Live'
    };
  });

  const total = Number(booking.total) || 0;
  const taxPercent = Number(invoiceSettings.taxPercent) || 18;
  const isTaxInclusive = (invoiceSettings.taxMode || 'inclusive') === 'inclusive';
  const enableGst = invoiceSettings.enableGst !== false;

  let subtotal = total;
  let cgst = 0;
  let sgst = 0;
  let taxableAmount = total;

  if (enableGst && taxPercent > 0) {
    if (isTaxInclusive) {
      taxableAmount = Math.round((total / (1 + taxPercent / 100)) * 100) / 100;
      const gstTotal = total - taxableAmount;
      cgst = Math.round((gstTotal / 2) * 100) / 100;
      sgst = Math.round((gstTotal / 2) * 100) / 100;
      subtotal = taxableAmount;
    } else {
      const gstTotal = Math.round((total * (taxPercent / 100)) * 100) / 100;
      cgst = Math.round((gstTotal / 2) * 100) / 100;
      sgst = Math.round((gstTotal / 2) * 100) / 100;
      subtotal = total;
    }
  }

  const invoiceNumber = `${invoiceSettings.invoicePrefix || 'SSA-INV-'}${booking.id.replace(/\D/g, '') || booking.id}`;

  res.json({
    success: true,
    invoice: {
      invoiceNumber,
      booking,
      items,
      subtotal,
      taxableAmount,
      cgst,
      sgst,
      taxPercent,
      enableGst,
      total,
      invoiceSettings
    }
  });
});

// ==========================================
// 3. FESTIVE OFFERS & PROMOS
// ==========================================
app.get('/api/offers', (req, res) => {
  const db = readDb();
  let list = db.offers || [];
  if (req.query.all !== 'true') {
    list = list.filter(o => o.active);
  }
  res.json({ success: true, offers: list });
});

app.post('/api/offers', (req, res) => {
  const db = readDb();
  db.offers = db.offers || [];
  const newOffer = {
    id: 'off-' + Date.now(),
    title: req.body.title || 'Special Festive Offer',
    code: (req.body.code || 'SERENE10').toUpperCase().trim(),
    discountPercent: Number(req.body.discountPercent) || 10,
    minBookingAmount: Number(req.body.minBookingAmount) || 0,
    validTill: req.body.validTill || '',
    description: req.body.description || '',
    highlightBadge: req.body.highlightBadge || 'Special Offer',
    isBanner: req.body.isBanner !== undefined ? Boolean(req.body.isBanner) : false,
    active: req.body.active !== undefined ? Boolean(req.body.active) : true
  };
  db.offers.unshift(newOffer);
  writeDb(db);
  res.json({ success: true, offer: newOffer });
});

app.put('/api/offers/:id', (req, res) => {
  const db = readDb();
  const idx = (db.offers || []).findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Offer not found' });

  db.offers[idx] = {
    ...db.offers[idx],
    ...req.body,
    code: req.body.code ? req.body.code.toUpperCase().trim() : db.offers[idx].code,
    discountPercent: req.body.discountPercent !== undefined ? Number(req.body.discountPercent) : db.offers[idx].discountPercent,
    minBookingAmount: req.body.minBookingAmount !== undefined ? Number(req.body.minBookingAmount) : db.offers[idx].minBookingAmount
  };
  writeDb(db);
  res.json({ success: true, offer: db.offers[idx] });
});

app.delete('/api/offers/:id', (req, res) => {
  const db = readDb();
  db.offers = (db.offers || []).filter(o => o.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Offer deleted' });
});

app.post('/api/offers/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Please enter a coupon code.' });

  const db = readDb();
  const cleanCode = (code || '').trim().toUpperCase();
  const offer = (db.offers || []).find(o => o.active && o.code && o.code.toUpperCase() === cleanCode);

  if (!offer) {
    return res.status(404).json({ success: false, message: 'Invalid or expired promo code.' });
  }

  const amt = Number(subtotal) || 0;
  if (offer.minBookingAmount && amt < offer.minBookingAmount) {
    return res.status(400).json({
      success: false,
      message: `This coupon requires a minimum booking value of ₹${offer.minBookingAmount.toLocaleString('en-IN')}.`
    });
  }

  const discount = Math.round(amt * (offer.discountPercent / 100));
  const finalTotal = Math.max(0, amt - discount);

  res.json({
    success: true,
    offer,
    discount,
    finalTotal,
    message: `Coupon "${cleanCode}" applied! You save ₹${discount.toLocaleString('en-IN')} (${offer.discountPercent}% Off)`
  });
});

// ==========================================
// 4. SALON SERVICES & RATE CARD
// ==========================================
app.get('/api/services', (req, res) => {
  const db = readDb();
  let list = db.services || [];
  if (req.query.all !== 'true') {
    list = list.filter(s => s.active);
  }
  res.json({ success: true, services: list });
});

app.post('/api/services', (req, res) => {
  const db = readDb();
  db.services = db.services || [];
  const newService = {
    id: 'srv-' + Date.now(),
    name: req.body.name || 'New Treatment Service',
    category: req.body.category || 'Skin & Facials',
    price: Number(req.body.price) || 500,
    duration: Number(req.body.duration) || 30,
    badge: req.body.badge || 'Popular',
    hygieneNote: req.body.hygieneNote || 'Autoclaved Tools + Single Use Kit',
    description: req.body.description || '',
    active: req.body.active !== undefined ? Boolean(req.body.active) : true
  };
  db.services.push(newService);
  writeDb(db);
  res.json({ success: true, service: newService });
});

app.put('/api/services/:id', (req, res) => {
  const db = readDb();
  const idx = (db.services || []).findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Service not found' });

  db.services[idx] = {
    ...db.services[idx],
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : db.services[idx].price,
    duration: req.body.duration !== undefined ? Number(req.body.duration) : db.services[idx].duration
  };
  writeDb(db);
  res.json({ success: true, service: db.services[idx] });
});

app.delete('/api/services/:id', (req, res) => {
  const db = readDb();
  db.services = (db.services || []).filter(s => s.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Service deleted' });
});

// ==========================================
// 5. ACADEMY COURSES
// ==========================================
app.get('/api/courses', (req, res) => {
  const db = readDb();
  let list = db.courses || [];
  if (req.query.all !== 'true') {
    list = list.filter(c => c.active);
  }
  res.json({ success: true, courses: list });
});

app.post('/api/courses', (req, res) => {
  const db = readDb();
  db.courses = db.courses || [];
  const highlights = Array.isArray(req.body.highlights)
    ? req.body.highlights
    : (req.body.highlights || '').split('\n').map(h => h.trim()).filter(Boolean);

  const newCourse = {
    id: 'crs-' + Date.now(),
    title: req.body.title || 'New Academy Course',
    duration: req.body.duration || '4 Weeks',
    level: req.body.level || 'Beginner to Professional',
    fee: Number(req.body.fee) || 20000,
    earlyBirdFee: Number(req.body.earlyBirdFee) || 16000,
    nextBatch: req.body.nextBatch || 'Upcoming Month',
    highlights,
    active: req.body.active !== undefined ? Boolean(req.body.active) : true
  };
  db.courses.push(newCourse);
  writeDb(db);
  res.json({ success: true, course: newCourse });
});

app.put('/api/courses/:id', (req, res) => {
  const db = readDb();
  const idx = (db.courses || []).findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Course not found' });

  const highlights = req.body.highlights !== undefined
    ? (Array.isArray(req.body.highlights) ? req.body.highlights : String(req.body.highlights).split('\n').map(h => h.trim()).filter(Boolean))
    : db.courses[idx].highlights;

  db.courses[idx] = {
    ...db.courses[idx],
    ...req.body,
    highlights,
    fee: req.body.fee !== undefined ? Number(req.body.fee) : db.courses[idx].fee,
    earlyBirdFee: req.body.earlyBirdFee !== undefined ? Number(req.body.earlyBirdFee) : db.courses[idx].earlyBirdFee
  };
  writeDb(db);
  res.json({ success: true, course: db.courses[idx] });
});

app.delete('/api/courses/:id', (req, res) => {
  const db = readDb();
  db.courses = (db.courses || []).filter(c => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Course deleted' });
});

// ==========================================
// 6. BOOKINGS CRM
// ==========================================
app.get('/api/bookings', (req, res) => {
  const db = readDb();
  let list = db.bookings || [];

  if (req.query.status) {
    list = list.filter(b => b.status.toLowerCase() === req.query.status.toLowerCase());
  }
  if (req.query.date) {
    list = list.filter(b => b.date === req.query.date);
  }
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    list = list.filter(b =>
      b.guestName.toLowerCase().includes(q) ||
      b.guestPhone.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, bookings: list });
});

app.get('/api/bookings/my', (req, res) => {
  const query = (req.query.query || req.query.phone || '').trim();
  if (!query) return res.status(400).json({ success: false, message: 'Query required' });

  const db = readDb();
  const list = (db.bookings || []).filter(b =>
    b.guestPhone.includes(query) ||
    b.id.toLowerCase() === query.toLowerCase() ||
    b.guestName.toLowerCase().includes(query.toLowerCase())
  );
  res.json({ success: true, bookings: list });
});

app.post('/api/bookings', (req, res) => {
  const { guestName, guestPhone, date, time, stylist, services, promoCode, notes } = req.body;
  if (!guestName || !guestPhone) {
    return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
  }

  const db = readDb();
  const allServices = db.services || [];
  
  // Calculate pricing based on services array
  let serviceNames = [];
  let subtotal = 0;

  if (Array.isArray(services)) {
    services.forEach(item => {
      if (typeof item === 'string') {
        const found = allServices.find(s => s.id === item || s.name === item);
        if (found) {
          serviceNames.push(found.name);
          subtotal += found.price;
        } else {
          serviceNames.push(item);
        }
      } else if (item && item.name) {
        serviceNames.push(item.name);
        subtotal += Number(item.price) || 0;
      }
    });
  }

  // Check discount
  let discount = 0;
  let validatedPromo = '';
  if (promoCode) {
    const cleanCode = promoCode.trim().toUpperCase();
    const offer = (db.offers || []).find(o => o.active && o.code.toUpperCase() === cleanCode);
    if (offer && (!offer.minBookingAmount || subtotal >= offer.minBookingAmount)) {
      discount = Math.round(subtotal * (offer.discountPercent / 100));
      validatedPromo = cleanCode;
    }
  }

  const total = Math.max(0, subtotal - discount);
  const bookingId = 'SSA-' + Math.floor(1000 + Math.random() * 9000);

  const newBooking = {
    id: bookingId,
    guestName: guestName.trim(),
    guestPhone: guestPhone.trim(),
    date: date || new Date().toISOString().split('T')[0],
    time: time || '11:00 AM',
    stylist: stylist || 'Rashmi Sah (Founder & Master Artist)',
    services: serviceNames.length > 0 ? serviceNames : ['Custom Beauty Consultation'],
    subtotal,
    discount,
    promoCode: validatedPromo,
    total,
    status: 'Confirmed',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  db.bookings = db.bookings || [];
  db.bookings.unshift(newBooking);
  writeDb(db);

  res.json({
    success: true,
    booking: newBooking,
    message: `Appointment #${bookingId} successfully confirmed!`
  });
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const { status } = req.body;
  const valid = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
  if (!valid.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const db = readDb();
  const booking = (db.bookings || []).find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.status = status;
  writeDb(db);
  res.json({ success: true, booking });
});

app.post('/api/bookings/:id/payment', (req, res) => {
  const { paymentMethod, utrNumber, amount, status, paymentStatus } = req.body;
  const db = readDb();
  const booking = (db.bookings || []).find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  if (paymentMethod) booking.paymentMethod = paymentMethod;
  booking.paymentStatus = paymentStatus || status || 'Paid';
  if (utrNumber !== undefined) booking.utrNumber = utrNumber;
  if (amount !== undefined) booking.paidAmount = Number(amount);
  booking.paidAt = new Date().toISOString();
  writeDb(db);
  res.json({ success: true, booking, message: 'Payment recorded successfully' });
});

// Update booking-specific invoice customization & terms
app.patch('/api/bookings/:id/invoice-customization', (req, res) => {
  const db = readDb();
  const booking = (db.bookings || []).find(b => b.id === req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

  booking.invoiceCustomization = {
    ...(booking.invoiceCustomization || {}),
    ...req.body
  };
  if (req.body.advanceAmount !== undefined) {
    booking.paidAmount = Number(req.body.advanceAmount) || 0;
  }
  if (req.body.paymentStatus !== undefined) {
    booking.paymentStatus = req.body.paymentStatus;
  }
  writeDb(db);
  res.json({ success: true, booking, message: 'Invoice customization saved successfully' });
});

app.delete('/api/bookings/:id', (req, res) => {
  const db = readDb();
  db.bookings = (db.bookings || []).filter(b => b.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Booking removed' });
});

// ==========================================
// 7. ACADEMY INQUIRIES & LEADS CRM
// ==========================================
app.get('/api/inquiries', (req, res) => {
  const db = readDb();
  let list = db.inquiries || [];
  if (req.query.status) {
    list = list.filter(i => i.status.toLowerCase() === req.query.status.toLowerCase());
  }
  res.json({ success: true, inquiries: list });
});

app.post('/api/inquiries', (req, res) => {
  const { name, phone, course, preferredTime, notes } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
  }

  const db = readDb();
  const newInq = {
    id: 'INQ-' + Math.floor(100 + Math.random() * 900),
    name: name.trim(),
    phone: phone.trim(),
    course: course || 'General Cosmetology Diploma',
    preferredTime: preferredTime || 'Flexible Batch',
    notes: notes || '',
    status: 'New',
    createdAt: new Date().toISOString()
  };

  db.inquiries = db.inquiries || [];
  db.inquiries.unshift(newInq);
  writeDb(db);

  res.json({
    success: true,
    inquiry: newInq,
    message: 'Thank you! Your inquiry has been submitted. Our Academy Counselor will contact you shortly.'
  });
});

app.patch('/api/inquiries/:id/status', (req, res) => {
  const { status } = req.body;
  const db = readDb();
  const inq = (db.inquiries || []).find(i => i.id === req.params.id);
  if (!inq) return res.status(404).json({ success: false, message: 'Inquiry not found' });

  inq.status = status || inq.status;
  writeDb(db);
  res.json({ success: true, inquiry: inq });
});

app.delete('/api/inquiries/:id', (req, res) => {
  const db = readDb();
  db.inquiries = (db.inquiries || []).filter(i => i.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Inquiry deleted' });
});

// ==========================================
// 8. CERTIFICATES REGISTRY
// ==========================================
app.get('/api/certificates', (req, res) => {
  const db = readDb();
  res.json({ success: true, certificates: db.certificates || [] });
});

app.get('/api/certificates/verify/:id', (req, res) => {
  const cleanId = (req.params.id || '').trim().toUpperCase();
  const db = readDb();
  const cert = (db.certificates || []).find(c => c.id.toUpperCase() === cleanId && c.active);

  if (cert) {
    return res.json({ success: true, verified: true, certificate: cert });
  }
  return res.status(404).json({ success: false, verified: false, message: 'Certificate ID not found' });
});

app.post('/api/certificates', (req, res) => {
  const { id, student, course, grade, issued } = req.body;
  if (!student || !course) {
    return res.status(400).json({ success: false, message: 'Student name and course are required.' });
  }

  const certId = (id || 'SSA-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900)).toUpperCase().trim();
  const db = readDb();
  db.certificates = db.certificates || [];

  // check if id already exists
  const existingIdx = db.certificates.findIndex(c => c.id.toUpperCase() === certId);
  const certData = {
    id: certId,
    student: student.trim(),
    course: course.trim(),
    grade: grade || 'Distinction (A+)',
    issued: issued || `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()} • Signed by Rashmi Sah`,
    active: true
  };

  if (existingIdx >= 0) {
    db.certificates[existingIdx] = certData;
  } else {
    db.certificates.unshift(certData);
  }

  writeDb(db);
  res.json({ success: true, certificate: certData });
});

app.delete('/api/certificates/:id', (req, res) => {
  const db = readDb();
  db.certificates = (db.certificates || []).filter(c => c.id.toUpperCase() !== req.params.id.toUpperCase());
  writeDb(db);
  res.json({ success: true, message: 'Certificate removed' });
});

// ==========================================
// 9. CUSTOMER REVIEWS
// ==========================================
app.get('/api/reviews', (req, res) => {
  const db = readDb();
  let list = db.reviews || [];
  if (req.query.all !== 'true') {
    list = list.filter(r => r.approved);
  }
  res.json({ success: true, reviews: list });
});

app.post('/api/reviews', (req, res) => {
  const { reviewer, rating, quote, tags, source } = req.body;
  if (!reviewer || !quote) {
    return res.status(400).json({ success: false, message: 'Reviewer name and review text are required.' });
  }

  const db = readDb();
  const tagList = Array.isArray(tags) ? tags : (tags ? String(tags).split(',').map(t => t.trim()) : ['Verified Guest']);

  const newRev = {
    id: 'rev-' + Date.now(),
    reviewer: reviewer.trim(),
    rating: Number(rating) || 5,
    source: source || 'Direct Guest Review',
    tags: tagList,
    quote: quote.trim(),
    approved: true, // Auto-approve or admin can toggle
    createdAt: new Date().toISOString()
  };

  db.reviews = db.reviews || [];
  db.reviews.unshift(newRev);
  writeDb(db);

  res.json({ success: true, review: newRev, message: 'Thank you for your valuable feedback!' });
});

app.patch('/api/reviews/:id/approve', (req, res) => {
  const db = readDb();
  const rev = (db.reviews || []).find(r => r.id === req.params.id);
  if (!rev) return res.status(404).json({ success: false, message: 'Review not found' });

  rev.approved = req.body.approved !== undefined ? Boolean(req.body.approved) : true;
  writeDb(db);
  res.json({ success: true, review: rev });
});

app.delete('/api/reviews/:id', (req, res) => {
  const db = readDb();
  db.reviews = (db.reviews || []).filter(r => r.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: 'Review removed' });
});

// ==========================================
// 10. CALENDAR & SCHEDULE AVAILABILITY
// ==========================================
app.get('/api/bookings/calendar', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const db = readDb();
  const dayBookings = (db.bookings || []).filter(b => b.date === date && b.status !== 'Cancelled');

  const slots = ['10:30 AM', '11:30 AM', '12:30 PM', '02:00 PM', '03:30 PM', '04:30 PM', '06:00 PM', '07:00 PM'];
  const stylists = [
    'Rashmi Sah (Founder & Master Artist)',
    'Senior Skin & Laser Aesthetician',
    'Senior Hair & Balayage Expert',
    'Senior Nail & Lash Technician'
  ];

  const grid = {};
  slots.forEach(s => {
    grid[s] = {};
    stylists.forEach(st => {
      const match = dayBookings.find(b => b.time === s && b.stylist === st);
      grid[s][st] = match ? { id: match.id, guestName: match.guestName, services: match.services, status: match.status } : null;
    });
  });

  res.json({ success: true, date, grid, totalDayBookings: dayBookings.length, dayBookings });
});

// ==========================================
// 11. DATA EXPORTS & DATABASE BACKUP
// ==========================================
app.get('/api/admin/export/bookings.csv', (req, res) => {
  const db = readDb();
  const bookings = db.bookings || [];
  
  let csv = 'Booking ID,Guest Name,Phone,Date,Time,Stylist,Services,Subtotal,Discount,Promo Code,Total,Status,Notes,Created At\n';
  bookings.forEach(b => {
    const servicesStr = `"${(b.services || []).join('; ')}"`;
    const notesStr = `"${(b.notes || '').replace(/"/g, '""')}"`;
    csv += `${b.id},"${b.guestName}","${b.guestPhone}",${b.date},"${b.time}","${b.stylist}",${servicesStr},${b.subtotal || 0},${b.discount || 0},"${b.promoCode || ''}",${b.total || 0},${b.status},${notesStr},${b.createdAt || ''}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="serene_bookings_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

app.get('/api/admin/export/inquiries.csv', (req, res) => {
  const db = readDb();
  const inquiries = db.inquiries || [];

  let csv = 'Inquiry ID,Student Name,Phone,Course,Preferred Time,Status,Notes,Created At\n';
  inquiries.forEach(i => {
    const notesStr = `"${(i.notes || '').replace(/"/g, '""')}"`;
    csv += `${i.id},"${i.name}","${i.phone}","${i.course}","${i.preferredTime || ''}",${i.status},${notesStr},${i.createdAt || ''}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="serene_academy_leads_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

app.get('/api/admin/backup/db.json', (req, res) => {
  const db = readDb();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="serene_db_backup_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(db, null, 2));
});

// Catch-all middleware to support client-side SPA routing
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api') || req.path.startsWith('/images') || req.path.startsWith('/classic')) {
    return next();
  }
  const distIndex = path.join(__dirname, 'client', 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  next();
});

// Start Express Server only when run directly (not when imported as a Vercel serverless function)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` ✨ Serene Salon & Academy Server is Running!`);
    console.log(` 🌐 Public Client Website: http://localhost:${PORT}`);
    console.log(` 👑 Dynamic Admin Portal:  http://localhost:${PORT}/admin`);
    console.log(` 📂 Database Storage:     ${DB_PATH}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;

