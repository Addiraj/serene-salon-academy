// ==========================================
// SERENE SALON & ACADEMY - CLIENT APPLICATION
// ==========================================

let clientState = {
  services: [],
  courses: [],
  offers: [],
  reviews: [],
  cart: [],
  activePromo: null,
  selectedCategory: 'all',
  selectedReviewTag: 'all'
};

// Toast notification helper
function showToast(msg) {
  const banner = document.getElementById('toastBanner');
  const text = document.getElementById('toastMessageText');
  if (!banner || !text) return;
  text.textContent = msg;
  banner.classList.remove('hidden');
  if (window._clientToastTimer) clearTimeout(window._clientToastTimer);
  window._clientToastTimer = setTimeout(() => {
    banner.classList.add('hidden');
  }, 3500);
}

// ==========================================
// 1. DATA INITIALIZATION
// ==========================================
async function initAppData() {
  await Promise.all([
    fetchOffers(),
    fetchServices(),
    fetchCourses(),
    fetchReviews(),
    fetchSettings()
  ]);

  // Load cart from localStorage if available
  try {
    const savedCart = localStorage.getItem('serene_cart');
    if (savedCart) {
      clientState.cart = JSON.parse(savedCart);
    } else if (clientState.services.length > 0) {
      // Default initial selection
      clientState.cart = [clientState.services[0].id];
    }
  } catch (e) {
    if (clientState.services.length > 0) clientState.cart = [clientState.services[0].id];
  }

  populateQuickBookingDropdown();
  renderServicesGrid();
  renderAcademyCourses();
  renderReviews();
  renderCartDrawer();
}

// Fetch settings (timings, contact, etc.)
async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success && data.settings) {
      const s = data.settings;
      if (s.phone) {
        document.querySelectorAll('.salon-phone-text').forEach(el => el.textContent = s.phone);
      }
      if (s.whatsapp) {
        document.querySelectorAll('.salon-wa-link').forEach(el => {
          el.href = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent('Hello Serene Salon & Academy! I would like to inquire about appointments.')}`;
        });
      }
      if (s.address) {
        document.querySelectorAll('.salon-address-text').forEach(el => el.textContent = s.address);
      }
      if (s.timings) {
        document.querySelectorAll('.salon-timings-text').forEach(el => el.textContent = s.timings);
      }
    }
  } catch (err) {
    console.error('Settings error:', err);
  }
}

// ==========================================
// 2. DYNAMIC FESTIVE OFFERS
// ==========================================
async function fetchOffers() {
  try {
    const res = await fetch('/api/offers');
    const data = await res.json();
    if (data.success) {
      clientState.offers = data.offers || [];
      renderFestiveBanner();
    }
  } catch (err) {
    console.error('Offers fetch error:', err);
  }
}

function renderFestiveBanner() {
  const bannerContainer = document.getElementById('festiveBannerBar');
  if (!bannerContainer) return;

  const bannerOffer = clientState.offers.find(o => o.isBanner && o.active) || clientState.offers.find(o => o.active);
  if (!bannerOffer) {
    bannerContainer.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="font-semibold tracking-wide">Vadodara's Clinical-Sterilization Luxury Women's Salon & Academy</span>
        <span class="hidden sm:inline text-champagne-300">• Authentic Mono-Dose Treatments</span>
      </div>`;
    return;
  }

  bannerContainer.innerHTML = `
    <div class="flex items-center gap-2 sm:gap-3 flex-wrap justify-center text-xs">
      <span class="px-2 py-0.5 rounded-full bg-champagne-400/20 text-champagne-300 font-bold border border-champagne-400/30 uppercase tracking-wider text-[10px]">
        ✨ ${bannerOffer.highlightBadge || 'Festive Offer'}
      </span>
      <span class="font-bold text-champagne-100">${bannerOffer.title}:</span>
      <span class="text-champagne-200">${bannerOffer.description || `Get ${bannerOffer.discountPercent}% Off!`}</span>
      <button onclick="applyPromoQuick('${bannerOffer.code}')" class="px-2.5 py-0.5 rounded bg-champagne-500 hover:bg-champagne-400 text-espresso-950 font-mono font-bold text-[11px] shadow transition ml-1">
        Code: ${bannerOffer.code} (Click to Use)
      </button>
    </div>`;

  checkFestiveWelcomePopup(bannerOffer);
}

function checkFestiveWelcomePopup(offer) {
  if (!offer || sessionStorage.getItem('serene_festive_seen')) return;
  setTimeout(() => {
    const modal = document.getElementById('festiveWelcomeModal');
    if (!modal) return;
    document.getElementById('festivePopupTitle').textContent = offer.title || 'Festive Glamour & Glow';
    document.getElementById('festivePopupDesc').textContent = offer.description || `Enjoy flat ${offer.discountPercent}% off on our signature salon rituals!`;
    document.getElementById('festivePopupCode').textContent = offer.code || 'SERENE20';
    modal.classList.remove('hidden');
  }, 1800);
}

function dismissFestiveWelcome() {
  document.getElementById('festiveWelcomeModal')?.classList.add('hidden');
  sessionStorage.setItem('serene_festive_seen', 'true');
}

function claimFestiveCoupon() {
  const code = document.getElementById('festivePopupCode')?.textContent || 'SERENE20';
  navigator.clipboard.writeText(code);
  showToast(`Festive code ${code} copied!`);
  dismissFestiveWelcome();
}

function claimFestiveCouponAndBook() {
  const code = document.getElementById('festivePopupCode')?.textContent || 'SERENE20';
  dismissFestiveWelcome();
  applyPromoQuick(code);
}

function applyPromoQuick(code) {
  const promoInput = document.getElementById('promoCodeInput');
  if (promoInput) promoInput.value = code;
  // Open cart drawer and apply
  document.getElementById('bookingDrawerModal').classList.remove('hidden');
  validateAndApplyPromo();
}

// ==========================================
// 3. SALON SERVICES & RATE CARD
// ==========================================
async function fetchServices() {
  try {
    const res = await fetch('/api/services');
    const data = await res.json();
    if (data.success) {
      clientState.services = data.services || [];
    }
  } catch (err) {
    console.error('Services fetch error:', err);
  }
}

function populateQuickBookingDropdown() {
  const sel = document.getElementById('quickServiceSelect');
  if (!sel) return;
  sel.innerHTML = clientState.services.map(s => `
    <option value="${s.id}">${s.name} — ₹${s.price.toLocaleString('en-IN')} (${s.duration}m)</option>
  `).join('');

  // Default dates to tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const qDate = document.getElementById('quickDateInput');
  const dDate = document.getElementById('drawerDateInput');
  if (qDate) qDate.value = tomorrow;
  if (dDate) dDate.value = tomorrow;
}

function renderServicesGrid() {
  const searchInput = document.getElementById('serviceSearchInput');
  const sortSelect = document.getElementById('serviceSortSelect');
  const grid = document.getElementById('servicesGrid');
  if (!grid) return;

  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const sortVal = sortSelect ? sortSelect.value : 'recommended';

  let filtered = clientState.services.filter(s => {
    const matchCat = clientState.selectedCategory === 'all' || s.category === clientState.selectedCategory;
    const matchQuery = !searchVal ||
      s.name.toLowerCase().includes(searchVal) ||
      (s.description || '').toLowerCase().includes(searchVal) ||
      s.category.toLowerCase().includes(searchVal);
    return matchCat && matchQuery;
  });

  if (sortVal === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sortVal === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (sortVal === 'duration') filtered.sort((a, b) => a.duration - b.duration);

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl p-10 text-center border border-champagne-200">
        <p class="font-editorial text-2xl font-bold text-espresso-900">No matching services found</p>
        <p class="text-xs text-espresso-800/70 mt-1">Try clearing your search query or selecting "All Services".</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(s => {
    const inCart = clientState.cart.includes(s.id);
    return `
      <div class="bg-white rounded-2xl border ${inCart ? 'border-champagne-600 ring-2 ring-champagne-400/50' : 'border-champagne-200'} p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
        <div class="space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-champagne-100 text-champagne-800 text-[11px] font-semibold">${s.category}</span>
            <span class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">${s.badge || 'Vadodara Special'}</span>
          </div>
          <h3 class="font-editorial text-2xl font-bold text-espresso-900 leading-snug">${s.name}</h3>
          <p class="text-xs text-espresso-800/80 leading-relaxed line-clamp-3">${s.description || ''}</p>
          
          <div class="pt-1">
            <div class="text-[11px] text-champagne-900 font-medium bg-champagne-50/70 p-2 rounded-xl border border-champagne-200 flex items-start gap-1.5">
              <span class="text-champagne-700 font-bold">🛡️</span>
              <span><strong>Hygiene Standard:</strong> ${s.hygieneNote || 'Autoclaved Sealed Pouches'}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-champagne-200/60 flex items-center justify-between">
          <div>
            <div class="text-xs text-espresso-800/70">⏱ ${s.duration} mins</div>
            <div class="font-editorial text-2xl font-bold text-espresso-950">₹${s.price.toLocaleString('en-IN')}</div>
          </div>
          <button type="button" data-service-id="${s.id}" class="toggle-service-btn px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
            inCart 
              ? 'bg-champagne-800 text-white hover:bg-champagne-900' 
              : 'bg-espresso-900 text-champagne-200 hover:bg-espresso-950'
          }">
            <span>${inCart ? '✓ Selected' : '+ Reserve Slot'}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 4. ACADEMY COURSES
// ==========================================
async function fetchCourses() {
  try {
    const res = await fetch('/api/courses');
    const data = await res.json();
    if (data.success) {
      clientState.courses = data.courses || [];
      populateCourseSelectInquiry();
    }
  } catch (err) {
    console.error('Courses fetch error:', err);
  }
}

function renderAcademyCourses() {
  const container = document.getElementById('academyCoursesList');
  if (!container) return;

  if (clientState.courses.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-500">Loading courses...</p>`;
    return;
  }

  container.innerHTML = clientState.courses.map(c => `
    <div class="p-5 rounded-2xl bg-white border border-champagne-200 shadow-sm hover:border-champagne-400 transition space-y-3">
      <div class="flex items-center justify-between gap-2">
        <span class="px-2.5 py-0.5 rounded-full bg-champagne-100 text-champagne-800 text-[11px] font-semibold">${c.level}</span>
        <span class="text-xs font-semibold text-espresso-800/80">⏱ ${c.duration}</span>
      </div>
      <h4 class="font-editorial text-2xl font-bold text-espresso-950">${c.title}</h4>
      <div class="space-y-1 text-xs text-espresso-800/80">
        ${(c.highlights || []).map(h => `<p class="flex items-center gap-1.5"><span class="text-emerald-700 font-bold">✓</span> ${h}</p>`).join('')}
      </div>
      <div class="pt-2 border-t border-champagne-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span class="text-xs text-espresso-800/70 line-through">₹${(c.fee || 0).toLocaleString('en-IN')}</span>
          <span class="font-bold text-emerald-800 text-sm ml-1.5">₹${(c.earlyBirdFee || c.fee || 0).toLocaleString('en-IN')} (Early-Bird)</span>
        </div>
        <button type="button" data-course-title="${c.title}" class="select-course-btn text-xs font-bold text-champagne-800 hover:text-champagne-950 underline underline-offset-4">
          Select for Inquiry →
        </button>
      </div>
    </div>
  `).join('');
}

function populateCourseSelectInquiry() {
  const sel = document.getElementById('inquiryCourseSelect');
  if (!sel) return;
  sel.innerHTML = clientState.courses.map(c => `
    <option value="${c.title}">${c.title} (Early-Bird: ₹${(c.earlyBirdFee || c.fee || 0).toLocaleString('en-IN')})</option>
  `).join('');
}

// ==========================================
// 5. REVIEWS & TESTIMONIALS
// ==========================================
async function fetchReviews() {
  try {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    if (data.success) {
      clientState.reviews = data.reviews || [];
    }
  } catch (err) {
    console.error('Reviews error:', err);
  }
}

function renderReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  const tag = clientState.selectedReviewTag;
  let filtered = clientState.reviews;
  if (tag !== 'all') {
    filtered = filtered.filter(r => (r.tags || []).includes(tag));
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-8 text-xs text-slate-500">No reviews found for this filter tag.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(r => `
    <div class="bg-champagne-50/70 border border-champagne-200 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow transition">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center text-amber-500 text-sm font-bold tracking-widest">${'★'.repeat(r.rating || 5)}</div>
          <span class="text-[11px] text-espresso-800/60 font-medium">${r.source || 'Verified Client'}</span>
        </div>
        <p class="text-xs sm:text-sm text-espresso-900 leading-relaxed italic">"${r.quote}"</p>
      </div>
      <div>
        <div class="font-bold text-xs text-espresso-950">${r.reviewer}</div>
        <div class="flex flex-wrap gap-1.5 mt-2">
          ${(r.tags || []).map(t => `<span class="px-2 py-0.5 rounded-full bg-white text-champagne-900 border border-champagne-200 text-[10px] font-semibold">${t}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// 6. BOOKING CART & PROMO CODE ENGINE
// ==========================================
function renderCartDrawer() {
  const badge = document.getElementById('cartCountBadge');
  if (badge) badge.textContent = clientState.cart.length;

  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  const items = clientState.cart
    .map(id => clientState.services.find(s => s.id === id))
    .filter(Boolean);

  if (items.length === 0) {
    container.innerHTML = `
      <div class="p-6 rounded-2xl bg-champagne-50 border border-champagne-200 text-center text-xs text-espresso-800">
        No services selected yet. Browse our Signature Rate Card to add treatments!
      </div>`;
  } else {
    container.innerHTML = items.map(item => `
      <div class="flex items-center justify-between p-3.5 rounded-xl bg-champagne-50/80 border border-champagne-200 text-xs">
        <div>
          <div class="font-bold text-espresso-950">${item.name}</div>
          <div class="text-[11px] text-espresso-800/70">⏱ ${item.duration} mins • ₹${item.price.toLocaleString('en-IN')}</div>
        </div>
        <button type="button" data-remove-id="${item.id}" class="remove-cart-item-btn text-rose-600 hover:text-rose-800 font-bold px-2.5 py-1 text-sm transition">
          ✕
        </button>
      </div>
    `).join('');
  }

  const subtotal = items.reduce((acc, s) => acc + s.price, 0);
  const totalMins = items.reduce((acc, s) => acc + s.duration, 0);
  let discount = 0;

  if (clientState.activePromo) {
    discount = Math.round(subtotal * (clientState.activePromo.discountPercent / 100));
  }

  const finalTotal = Math.max(0, subtotal - discount);

  const durationEl = document.getElementById('cartTotalDuration');
  const subtotalEl = document.getElementById('cartSubtotalAmount');
  const finalEl = document.getElementById('cartFinalAmount');
  const discountRow = document.getElementById('cartDiscountRow');
  const discountEl = document.getElementById('cartDiscountAmount');

  if (durationEl) durationEl.textContent = `${totalMins} mins`;
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString('en-IN')}`;

  if (discountRow && discountEl) {
    if (clientState.activePromo && discount > 0) {
      discountRow.classList.remove('hidden');
      discountEl.textContent = `-₹${discount.toLocaleString('en-IN')} (${clientState.activePromo.code})`;
    } else {
      discountRow.classList.add('hidden');
    }
  }

  if (finalEl) finalEl.textContent = `₹${finalTotal.toLocaleString('en-IN')}`;

  // Persist cart
  try {
    localStorage.setItem('serene_cart', JSON.stringify(clientState.cart));
  } catch (e) {}
}

async function validateAndApplyPromo() {
  const promoInput = document.getElementById('promoCodeInput');
  const resultBox = document.getElementById('promoCodeResult');
  if (!promoInput) return;

  const code = promoInput.value.trim().toUpperCase();
  if (!code) {
    if (resultBox) {
      resultBox.classList.remove('hidden');
      resultBox.className = 'text-xs text-rose-600 font-semibold';
      resultBox.textContent = 'Please enter a promo code.';
    }
    return;
  }

  const items = clientState.cart.map(id => clientState.services.find(s => s.id === id)).filter(Boolean);
  const subtotal = items.reduce((acc, s) => acc + s.price, 0);

  try {
    const res = await fetch('/api/offers/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const data = await res.json();

    if (data.success) {
      clientState.activePromo = data.offer;
      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.className = 'text-xs text-emerald-700 font-semibold';
        resultBox.textContent = `✓ ${data.message}`;
      }
      renderCartDrawer();
      showToast(`Promo ${code} applied!`);
    } else {
      clientState.activePromo = null;
      if (resultBox) {
        resultBox.classList.remove('hidden');
        resultBox.className = 'text-xs text-rose-600 font-semibold';
        resultBox.textContent = data.message || 'Invalid coupon code.';
      }
      renderCartDrawer();
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 7. APPOINTMENT SUBMISSION & WHATSAPP
// ==========================================
async function submitBooking() {
  if (clientState.cart.length === 0) {
    showToast('Please select at least one salon service first!');
    return;
  }

  const guestName = (document.getElementById('guestNameInput')?.value || '').trim();
  const guestPhone = (document.getElementById('guestPhoneInput')?.value || '').trim();
  const dateVal = document.getElementById('drawerDateInput')?.value;
  const timeVal = document.getElementById('drawerTimeSelect')?.value;
  const stylistVal = document.getElementById('drawerStylistSelect')?.value;
  const notes = (document.getElementById('guestNotesInput')?.value || '').trim();

  if (!guestName || !guestPhone) {
    alert('Please enter your full name and 10-digit mobile number.');
    return;
  }

  const payload = {
    guestName,
    guestPhone,
    date: dateVal,
    time: timeVal,
    stylist: stylistVal,
    services: clientState.cart,
    promoCode: clientState.activePromo ? clientState.activePromo.code : '',
    notes
  };

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      const b = data.booking;
      const confBox = document.getElementById('bookingConfirmationBox');
      if (confBox) {
        confBox.classList.remove('hidden');
        const waText = `Hello Serene Salon & Academy! My Booking ID is #${b.id}. Name: ${b.guestName} (${b.guestPhone}). Services: ${(b.services || []).join(', ')}. Date: ${b.date} at ${b.time} with ${b.stylist}. Total: ₹${(b.total || 0).toLocaleString('en-IN')}.`;

        confBox.innerHTML = `
          <div class="font-bold text-sm text-emerald-900">✓ Appointment Confirmed! Booking ID: #${b.id}</div>
          <div class="text-xs space-y-1 text-emerald-950 mt-1">
            <p><strong>Guest:</strong> ${b.guestName} (${b.guestPhone})</p>
            <p><strong>Schedule:</strong> ${b.date} at ${b.time} • <strong>Specialist:</strong> ${b.stylist}</p>
            <p><strong>Treatments:</strong> ${(b.services || []).join(', ')}</p>
            <p><strong>Total Bill:</strong> ₹${(b.total || 0).toLocaleString('en-IN')} (Sterile Autoclaved Station Reserved)</p>
          </div>
          <div class="pt-2.5 flex flex-wrap gap-2">
            <a href="https://wa.me/916203060789?text=${encodeURIComponent(waText)}" target="_blank" class="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition inline-block">
              Send Slot to Salon WhatsApp (+91 6203060789) ↗
            </a>
            <button type="button" onclick="openUpiPaymentModal('${b.id}', ${b.total})" class="px-3.5 py-2 rounded-xl bg-espresso-900 text-champagne-200 text-xs font-bold hover:bg-espresso-950 transition">
              📲 Pay via UPI QR (GPay/PhonePe)
            </button>
          </div>
        `;
      }

      showToast(`Appointment #${b.id} Confirmed!`);
      // Clear cart
      clientState.cart = [];
      clientState.activePromo = null;
      renderServicesGrid();
      renderCartDrawer();
    } else {
      alert(data.message || 'Error booking appointment.');
    }
  } catch (err) {
    console.error(err);
    alert('Server connection error. Please try again or WhatsApp us directly.');
  }
}

// ==========================================
// 8. ACADEMY CAREER COUNSELING SUBMISSION
// ==========================================
async function submitAcademyInquiry(e) {
  e.preventDefault();
  const name = document.getElementById('inquiryNameInput').value.trim();
  const phone = document.getElementById('inquiryPhoneInput').value.trim();
  const course = document.getElementById('inquiryCourseSelect').value;
  const preferredTime = document.getElementById('inquiryTimeSelect').value;
  const notes = (document.getElementById('inquiryNotesInput')?.value || '').trim();

  if (!name || !phone) {
    alert('Please provide your name and contact phone number.');
    return;
  }

  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, course, preferredTime, notes })
    });
    const data = await res.json();

    if (data.success) {
      const box = document.getElementById('academyInquirySuccessBox');
      if (box) {
        box.classList.remove('hidden');
        const waText = `Hello Rashmi Sah! I just submitted an inquiry for "${course}" (${preferredTime}) on the Serene Academy website. My name is ${name} (${phone}). Looking forward to course counseling & early-bird scholarship details.`;

        box.innerHTML = `
          <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-2">
            <div class="font-bold text-sm text-emerald-900">✓ Inquiry Submitted Successfully! (Lead #${data.inquiry.id})</div>
            <p>Our Academy Director Rashmi Sah will contact you for a personalized career counseling & scholarship session.</p>
            <div>
              <a href="https://wa.me/916203060789?text=${encodeURIComponent(waText)}" target="_blank" class="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs inline-block hover:bg-emerald-700 transition">
                Connect Directly on WhatsApp ↗
              </a>
            </div>
          </div>
        `;
      }
      document.getElementById('academyInquiryForm').reset();
      showToast('Career counseling inquiry submitted!');
    }
  } catch (err) {
    console.error(err);
    alert('Error submitting inquiry. Please call +91 6203060789 directly.');
  }
}

// ==========================================
// 9. CERTIFICATE VERIFICATION
// ==========================================
async function verifyCertificate() {
  const input = document.getElementById('certVerifyInput');
  const box = document.getElementById('certVerifyResult');
  if (!input || !box) return;

  const code = input.value.trim().toUpperCase();
  if (!code) {
    box.classList.remove('hidden');
    box.className = 'text-xs p-3 rounded-xl border bg-amber-50 border-amber-300 text-amber-950';
    box.innerHTML = 'Please enter a Certificate ID (e.g. <strong>SSA-2026-104</strong> or <strong>SSA-2025-089</strong>).';
    return;
  }

  try {
    const res = await fetch(`/api/certificates/verify/${code}`);
    const data = await res.json();
    box.classList.remove('hidden');

    if (data.success && data.certificate) {
      const c = data.certificate;
      box.className = 'text-xs p-4 rounded-xl border bg-emerald-50 border-emerald-300 text-emerald-950 space-y-2 shadow-sm';
      box.innerHTML = `
        <div class="flex items-center gap-1.5 font-bold text-emerald-900 text-sm">
          <span>✓</span>
          <span>Verified Academy Graduate Certificate</span>
        </div>
        <div><strong>Student:</strong> ${c.student}</div>
        <div><strong>Diploma / Course:</strong> ${c.course}</div>
        <div><strong>Standing / Grade:</strong> <span class="bg-emerald-200/70 text-emerald-950 px-2 py-0.5 rounded font-semibold">${c.grade}</span></div>
        <div class="text-[11px] text-emerald-800 pt-0.5">📜 ${c.issued}</div>
        <div class="pt-1">
          <button type="button" onclick="openOfficialCertModal('${c.id}', '${encodeURIComponent(c.student)}', '${encodeURIComponent(c.course)}', '${encodeURIComponent(c.grade)}')" class="px-3.5 py-1.5 rounded-lg bg-espresso-900 text-champagne-200 text-xs font-bold hover:bg-espresso-950 transition flex items-center gap-1.5">
            <span>🎓 View Official Printable Diploma</span>
            <span>→</span>
          </button>
        </div>
      `;
    } else {
      box.className = 'text-xs p-3 rounded-xl border bg-amber-50 border-amber-300 text-amber-950';
      box.innerHTML = `No verified record found for ID <strong>"${code}"</strong>. Try sample ID <strong>SSA-2026-104</strong>.`;
    }
  } catch (err) {
    console.error(err);
  }
}

// ------------------------------------------
// UPI QR & DIPLOMA HELPERS
// ------------------------------------------
function openUpiPaymentModal(id, amount) {
  const modal = document.getElementById('upiModal');
  if (!modal) return;
  document.getElementById('upiAmountText').textContent = `₹${(amount || 0).toLocaleString('en-IN')}`;
  document.getElementById('upiBookingRefText').textContent = `#${id}`;

  const upiUri = `upi://pay?pa=6203060789@upi&pn=Serene%20Salon&am=${amount}&tn=Booking%20${id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;
  document.getElementById('upiQrCodeImg').src = qrUrl;

  modal.classList.remove('hidden');
}

function confirmUpiPaymentDone() {
  document.getElementById('upiModal').classList.add('hidden');
  showToast('Thank you! Payment notification sent to salon.');
}

function openOfficialCertModal(id, studentEnc, courseEnc, gradeEnc) {
  const modal = document.getElementById('officialCertModal');
  if (!modal) return;

  document.getElementById('certModalId').textContent = id;
  document.getElementById('certModalStudent').textContent = decodeURIComponent(studentEnc);
  document.getElementById('certModalCourse').textContent = decodeURIComponent(courseEnc);
  document.getElementById('certModalGrade').textContent = decodeURIComponent(gradeEnc);

  modal.classList.remove('hidden');
}

function printOfficialCertificate() {
  const printContent = document.getElementById('printableCertArea').innerHTML;
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  printWindow.document.write(`
    <html>
      <head>
        <title>Graduation Diploma - Serene Academy</title>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Cormorant Garamond', serif; padding: 40px; background: #fff; color: #181210; text-align: center; }
          .border-4 { border: 6px double #C59653; padding: 40px; border-radius: 16px; background: #FAF7F2; }
          .text-3xl { font-size: 28px; font-weight: bold; }
          .text-4xl { font-size: 34px; font-weight: bold; }
          .flex { display: flex; justify-content: space-around; margin-top: 30px; border-top: 1px solid #D2AC74; padding-top: 20px; font-family: sans-serif; font-size: 13px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="border-4">
          ${printContent}
        </div>
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

// ==========================================
// 10. CLIENT "MY BOOKINGS" LOOKUP
// ==========================================
async function lookupMyBookings() {
  const query = (document.getElementById('myBookingsQueryInput')?.value || '').trim();
  const listContainer = document.getElementById('myBookingsResultsList');
  if (!listContainer) return;

  if (!query) {
    listContainer.innerHTML = `<p class="text-xs text-rose-600 text-center py-4">Please enter your 10-digit mobile number or Booking ID (e.g. SSA-8492).</p>`;
    return;
  }

  try {
    const res = await fetch(`/api/bookings/my?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.success && data.bookings && data.bookings.length > 0) {
      listContainer.innerHTML = data.bookings.map(b => `
        <div class="p-4 rounded-xl bg-champagne-50 border border-champagne-300 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-espresso-950 text-sm">Booking ID: #${b.id} — ${b.guestName}</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
              b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
              b.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
              b.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
            }">${b.status}</span>
          </div>
          <div class="text-espresso-800">📅 <strong>${b.date}</strong> at <strong>${b.time}</strong> • Specialist: <strong>${b.stylist}</strong></div>
          <div class="text-espresso-800">💆‍♀️ Services: ${(b.services || []).join(', ')}</div>
          <div class="font-bold text-emerald-800 pt-1">Total Bill: ₹${(b.total || 0).toLocaleString('en-IN')} (Sterile Kit Reserved)</div>
        </div>
      `).join('');
    } else {
      listContainer.innerHTML = `<p class="text-xs text-slate-500 text-center py-6">No appointments found matching "${query}". Try searching with your 10-digit mobile number.</p>`;
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 11. SUBMIT CLIENT REVIEW
// ==========================================
async function submitClientReview(e) {
  e.preventDefault();
  const reviewer = document.getElementById('clientReviewNameInput').value.trim();
  const rating = Number(document.getElementById('clientReviewRatingInput').value);
  const quote = document.getElementById('clientReviewQuoteInput').value.trim();
  const tag = document.getElementById('clientReviewTagInput').value;

  if (!reviewer || !quote) {
    alert('Please fill in your name and review details.');
    return;
  }

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewer,
        rating,
        quote,
        source: 'Verified Client Website Testimonial',
        tags: [tag, 'Verified Guest']
      })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('leaveReviewModal').classList.add('hidden');
      document.getElementById('leaveReviewForm').reset();
      showToast('Thank you! Your review has been submitted.');
      fetchReviews().then(renderReviews);
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 12. EVENT LISTENERS
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  initAppData();

  // Navigation scroll buttons
  document.querySelectorAll('.nav-scroll-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-nav');
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('mobileMenuPanel')?.classList.add('hidden');
    });
  });

  // Mobile menu toggle
  document.getElementById('mobileMenuToggleBtn')?.addEventListener('click', () => {
    document.getElementById('mobileMenuPanel')?.classList.toggle('hidden');
  });

  // Category filter tabs
  document.getElementById('serviceCategoryTabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.service-cat-btn');
    if (!btn) return;
    clientState.selectedCategory = btn.getAttribute('data-category');
    document.querySelectorAll('.service-cat-btn').forEach(b => {
      b.className = 'service-cat-btn px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition bg-white border border-champagne-300 text-espresso-800 hover:bg-champagne-100';
    });
    btn.className = 'service-cat-btn px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition bg-espresso-900 text-champagne-200 shadow';
    renderServicesGrid();
  });

  // Search & Sort listeners
  document.getElementById('serviceSearchInput')?.addEventListener('input', renderServicesGrid);
  document.getElementById('serviceSortSelect')?.addEventListener('change', renderServicesGrid);

  // Service toggle delegation
  document.getElementById('servicesGrid')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-service-btn');
    if (!btn) return;
    const id = btn.getAttribute('data-service-id');
    if (clientState.cart.includes(id)) {
      clientState.cart = clientState.cart.filter(x => x !== id);
      showToast('Treatment removed from booking.');
    } else {
      clientState.cart.push(id);
      showToast('Treatment added to booking!');
    }
    renderServicesGrid();
    renderCartDrawer();
  });

  // Quick Book Hero Widget Launch
  document.getElementById('quickBookLaunchBtn')?.addEventListener('click', () => {
    const srvId = document.getElementById('quickServiceSelect')?.value;
    const dateVal = document.getElementById('quickDateInput')?.value;
    const stylistVal = document.getElementById('quickStylistSelect')?.value;
    if (srvId && !clientState.cart.includes(srvId)) clientState.cart.push(srvId);
    if (dateVal && document.getElementById('drawerDateInput')) document.getElementById('drawerDateInput').value = dateVal;
    if (stylistVal && document.getElementById('drawerStylistSelect')) document.getElementById('drawerStylistSelect').value = stylistVal;
    renderServicesGrid();
    renderCartDrawer();
    document.getElementById('bookingDrawerModal')?.classList.remove('hidden');
  });

  // Lookbook Quick Add buttons
  document.querySelectorAll('.quick-add-look-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const srvId = btn.getAttribute('data-quick-add');
      if (srvId && !clientState.cart.includes(srvId)) clientState.cart.push(srvId);
      renderServicesGrid();
      renderCartDrawer();
      document.getElementById('bookingDrawerModal')?.classList.remove('hidden');
    });
  });

  // Cart Drawer Open/Close
  document.getElementById('openCartDrawerBtn')?.addEventListener('click', () => {
    document.getElementById('bookingDrawerModal')?.classList.remove('hidden');
  });
  document.getElementById('closeCartDrawerBtn')?.addEventListener('click', () => {
    document.getElementById('bookingDrawerModal')?.classList.add('hidden');
  });

  // Remove from cart delegation
  document.getElementById('cartItemsContainer')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-cart-item-btn');
    if (!btn) return;
    const id = btn.getAttribute('data-remove-id');
    clientState.cart = clientState.cart.filter(x => x !== id);
    renderServicesGrid();
    renderCartDrawer();
  });

  // Apply promo button
  document.getElementById('applyPromoBtn')?.addEventListener('click', validateAndApplyPromo);

  // Submit appointment button
  document.getElementById('confirmBookingBtn')?.addEventListener('click', submitBooking);

  // Certificate verify button
  document.getElementById('certVerifyBtn')?.addEventListener('click', verifyCertificate);

  // Academy Inquiry Form submit
  document.getElementById('academyInquiryForm')?.addEventListener('submit', submitAcademyInquiry);

  // Select course delegation in academy section
  document.getElementById('academyCoursesList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.select-course-btn');
    if (!btn) return;
    const courseTitle = btn.getAttribute('data-course-title');
    const sel = document.getElementById('inquiryCourseSelect');
    if (sel && courseTitle) {
      sel.value = courseTitle;
      document.getElementById('academyInquiryForm')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`Selected "${courseTitle}" for counseling.`);
    }
  });

  // Review tag filtering
  document.getElementById('reviewTagFilters')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.review-filter-btn');
    if (!btn) return;
    clientState.selectedReviewTag = btn.getAttribute('data-review-tag');
    document.querySelectorAll('.review-filter-btn').forEach(b => {
      b.className = 'review-filter-btn px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-white border border-champagne-300 text-espresso-800 hover:bg-champagne-100 transition';
    });
    btn.className = 'review-filter-btn px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-espresso-900 text-champagne-200 shadow transition';
    renderReviews();
  });

  // Leave Review Modal
  document.getElementById('openLeaveReviewBtn')?.addEventListener('click', () => {
    document.getElementById('leaveReviewModal')?.classList.remove('hidden');
  });
  document.getElementById('closeLeaveReviewModalBtn')?.addEventListener('click', () => {
    document.getElementById('leaveReviewModal')?.classList.add('hidden');
  });
  document.getElementById('leaveReviewForm')?.addEventListener('submit', submitClientReview);

  // My Bookings Modal
  document.getElementById('openMyBookingsBtn')?.addEventListener('click', () => {
    document.getElementById('myBookingsModal')?.classList.remove('hidden');
  });
  document.getElementById('closeMyBookingsModalBtn')?.addEventListener('click', () => {
    document.getElementById('myBookingsModal')?.classList.add('hidden');
  });
  document.getElementById('searchMyBookingsBtn')?.addEventListener('click', lookupMyBookings);

  // Hygiene cards interactivity
  document.querySelectorAll('.hygiene-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const detail = btn.getAttribute('data-hygiene');
      const box = document.getElementById('hygieneDetailBox');
      if (box && detail) {
        box.innerHTML = `<strong>Selected Protocol:</strong> ${detail}`;
      }
    });
  });
});

