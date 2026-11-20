import React, { useState, useMemo } from 'react';
import { 
  Printer, Share2, X, ShieldCheck, 
  Edit3, Save, RotateCcw, Plus, Trash2, CheckCircle2,
  Sparkles, Phone, MessageCircle, Tag
} from 'lucide-react';

// Preset Terms & Conditions by Service Category (Matching Owner Reference & POS Receipt)
const SERVICE_TERMS_PRESETS = {
  'standard-salon': {
    name: '📜 Standard Sanctuary Policies',
    defaultInclusions: 'Sterile Station Allocation, Autoclaved Implements & Single-Use Linens',
    terms: (adv, bal) => [
      `Thank you for visiting Serene Salon & Academy. Services, Products and Memberships once sold cannot be refunded, exchanged or transferred.`,
      `Salon management reserves the right to admission.`,
      `Only 1 benefit can be used at a time.`,
      `The remaining balance of ₹${(bal || 0).toLocaleString('en-IN')} is payable immediately upon completion of the service.`,
      `All instruments are hospital-grade autoclave sterilized in single-use sealed medical pouches.`
    ]
  },
  'bridal-makeup': {
    name: '💄 Bridal & Engagement Makeup',
    defaultInclusions: 'Makeup Studio Products with Hair Extension & Draping',
    terms: (adv, bal) => [
      `Thank you for visiting Serene Salon & Academy. Services, Products and Memberships once sold cannot be refunded, exchanged or transferred.`,
      `The advance payment of ₹${(adv || 0).toLocaleString('en-IN')} is strictly non-refundable and non-transferable.`,
      `The remaining balance of ₹${(bal || 0).toLocaleString('en-IN')} must be paid immediately upon completion of the service.`,
      `The booking is confirmed upon receipt of the advance payment.`,
      `Personal belongings, including jewellery, valuables and other items, must be kept safely by the client. Serene Salon & Academy will not be responsible for any loss or damage to personal belongings.`
    ]
  },
  'facials-clinical': {
    name: '💆‍♀️ Facials & Clinical Skin Rituals',
    defaultInclusions: 'Hospital-Grade Autoclaved Sealed Pouches Opened Live in Client Presence',
    terms: (adv, bal) => [
      `Thank you for visiting Serene Salon & Academy. Services, Products and Memberships once sold cannot be refunded, exchanged or transferred.`,
      `100% Hospital-grade autoclave sterilized single-use sealed medical pouches are opened live before treatment.`,
      `The client must disclose any active retinoids, AHA/BHA chemical peels, or dermatological conditions.`,
      `Direct sunlight, steam, and sauna should be avoided for 24-48 hours post-treatment.`,
      `The remaining balance of ₹${(bal || 0).toLocaleString('en-IN')} is payable immediately upon completion.`
    ]
  },
  'hair-treatments': {
    name: '💇‍♀️ Hair Spa, Color & Smoothing',
    defaultInclusions: 'Authentic L’Oréal & Olaplex Professional Ampoules & Autoclaved Tools',
    terms: (adv, bal) => [
      `Thank you for visiting Serene Salon & Academy. Services, Products and Memberships once sold cannot be refunded, exchanged or transferred.`,
      `Preliminary strand and sensitivity patch test is performed prior to chemical coloring or smoothing.`,
      `For keratin and botox smoothing, water contact and tying or pinning hair should be avoided for 48 hours.`,
      `Post-treatment sulfate-free salon home-care regimen is recommended for treatment longevity.`,
      `The remaining balance of ₹${(bal || 0).toLocaleString('en-IN')} is payable upon service completion.`
    ]
  },
  'nail-art': {
    name: '💅 Acrylic & Gel Nail Artistry',
    defaultInclusions: 'Medical Sanitization, Premium Gel Polish & Cuticle Care',
    terms: (adv, bal) => [
      `Thank you for visiting Serene Salon & Academy. Services, Products and Memberships once sold cannot be refunded, exchanged or transferred.`,
      `Authentic acrylic and gel formulas applied with sterile sanitized nail implements.`,
      `Any accidental lifting or stone repair within 48 hours is retouched complimentary at our sanctuary.`,
      `Avoid using nail extensions as tools or exposing them to harsh chemical cleaning agents.`,
      `Balance payment of ₹${(bal || 0).toLocaleString('en-IN')} is payable upon completion.`
    ]
  }
};

export default function DynamicInvoiceModal({ 
  isOpen, 
  onClose, 
  booking, 
  invoiceSettings = {}, 
  services = [],
  onUpdatePayment,
  isAdmin = false,
  showToast 
}) {
  if (!isOpen || !booking) return null;

  // Existing custom values on booking if saved earlier
  const savedCustom = booking.invoiceCustomization || {};

  // Infer default service category for terms preset
  const primaryServiceName = (booking.services && booking.services[0]) || 'Engagement Makeup';
  const inferPresetKey = () => {
    const s = primaryServiceName.toLowerCase();
    if (s.includes('makeup') || s.includes('bridal') || s.includes('engagement')) return 'bridal-makeup';
    if (s.includes('facial') || s.includes('clean-up') || s.includes('hydra')) return 'facials-clinical';
    if (s.includes('hair') || s.includes('color') || s.includes('spa') || s.includes('botox') || s.includes('keratin')) return 'hair-treatments';
    if (s.includes('nail')) return 'nail-art';
    return 'standard-salon'; // default to official salon POS receipt terms
  };

  const initialPresetKey = savedCustom.presetKey || inferPresetKey();

  // Parse all billed items & services (Supports both booking.items with discounts and booking.services)
  const initialItems = useMemo(() => {
    // 1. If saved on invoiceCustomization
    if (Array.isArray(savedCustom.items) && savedCustom.items.length > 0) {
      return savedCustom.items.map(it => ({
        id: it.id || ('it-' + Math.random()),
        name: it.name || 'Salon Treatment',
        category: it.category || '',
        originalPrice: Number(it.originalPrice !== undefined ? it.originalPrice : it.price) || 0,
        discount: Number(it.discount) || 0,
        discountPercent: Number(it.discountPercent) || 0,
        price: Number(it.price !== undefined ? it.price : Math.max(0, (it.originalPrice || 0) - (Number(it.discount) || 0))),
        inclusions: it.inclusions || 'Hospital-Grade Autoclaved Sealed Pouches Opened Live in Client Presence'
      }));
    }
    // 2. If booking.items exists
    if (Array.isArray(booking.items) && booking.items.length > 0) {
      return booking.items.map(it => ({
        id: it.id || ('it-' + Math.random()),
        name: it.name || 'Salon Treatment',
        category: it.category || '',
        originalPrice: Number(it.originalPrice !== undefined ? it.originalPrice : it.price) || 0,
        discount: Number(it.discount) || 0,
        discountPercent: Number(it.discountPercent) || 0,
        price: Number(it.price !== undefined ? it.price : Math.max(0, (it.originalPrice || 0) - (Number(it.discount) || 0))),
        inclusions: it.inclusions || 'Hospital-Grade Autoclaved Sealed Pouches Opened Live in Client Presence'
      }));
    }
    // 3. If booking.services is an array of strings or objects
    if (Array.isArray(booking.services) && booking.services.length > 0) {
      const avgPrice = Math.round((Number(booking.total) || 0) / booking.services.length);
      return booking.services.map((srv, idx) => {
        const srvName = typeof srv === 'string' ? srv : (srv.name || 'Salon Treatment');
        const srvPrice = typeof srv === 'object' && srv.price ? Number(srv.price) : null;
        const found = (services || []).find(s => s.name === srvName || s.id === srvName);
        const orig = srvPrice !== null ? srvPrice : (found ? Number(found.price) : (avgPrice || 1000));
        return {
          id: (typeof srv === 'object' && srv.id) || (found && found.id) || ('srv-' + idx),
          name: srvName,
          category: (found && found.category) || '',
          originalPrice: orig,
          discount: 0,
          discountPercent: 0,
          price: orig,
          inclusions: (found && (found.hygieneNote || found.badge)) || 'Hospital-Grade Autoclaved Sealed Pouches Opened Live in Client Presence'
        };
      });
    }
    // 4. Fallback single service
    return [{
      id: 'fallback-0',
      name: primaryServiceName,
      originalPrice: Number(booking.total) || 6400,
      discount: 0,
      discountPercent: 0,
      price: Number(booking.total) || 6400,
      inclusions: 'Hospital-Grade Autoclaved Sealed Pouches Opened Live in Client Presence'
    }];
  }, [booking, savedCustom, services, primaryServiceName]);

  const [invoiceItems, setInvoiceItems] = useState(initialItems);

  // Financial Calculations
  const grossServicesAmount = useMemo(() => {
    return invoiceItems.reduce((acc, it) => acc + (Number(it.originalPrice !== undefined ? it.originalPrice : it.price) || 0), 0);
  }, [invoiceItems]);

  const totalItemDiscounts = useMemo(() => {
    return invoiceItems.reduce((acc, it) => acc + (Number(it.discount) || 0), 0);
  }, [invoiceItems]);

  const calculatedNetTotal = Math.max(0, grossServicesAmount - totalItemDiscounts);
  const totalAmount = savedCustom.totalAmount !== undefined 
    ? Number(savedCustom.totalAmount) 
    : (booking.total !== undefined && booking.total > 0 ? Number(booking.total) : calculatedNetTotal);

  // Default Invoice Document Title
  const defaultTitle = savedCustom.invoiceTitle || (
    primaryServiceName.toLowerCase().includes('engagement') ? 'ENGAGEMENT MAKEUP BOOKING INVOICE' :
    primaryServiceName.toLowerCase().includes('bridal') ? 'BRIDAL MAKEUP BOOKING INVOICE' :
    'OFFICIAL BOOKING INVOICE'
  );

  const [invoiceTitle, setInvoiceTitle] = useState(defaultTitle);
  const [invoiceDate, setInvoiceDate] = useState(savedCustom.invoiceDate || booking.date || new Date().toISOString().split('T')[0]);
  const [invoiceTime, setInvoiceTime] = useState(savedCustom.invoiceTime || booking.time || '10:00 AM');

  // Advance & Balance
  const initialAdvance = savedCustom.advanceAmount !== undefined 
    ? Number(savedCustom.advanceAmount) 
    : (booking.paidAmount !== undefined ? Number(booking.paidAmount) : Math.round(totalAmount * 0.2));

  const [advanceAmount, setAdvanceAmount] = useState(initialAdvance);
  const balanceDue = Math.max(0, totalAmount - advanceAmount);

  // Inclusions description (global fallback)
  const [inclusionsText, setInclusionsText] = useState(
    savedCustom.inclusionsText || SERVICE_TERMS_PRESETS[initialPresetKey]?.defaultInclusions || 'Makeup Studio Products with Hair Extension'
  );

  // Editable Terms & Conditions list
  const [termsList, setTermsList] = useState(() => {
    if (Array.isArray(savedCustom.terms) && savedCustom.terms.length > 0) {
      return savedCustom.terms;
    }
    const presetFn = SERVICE_TERMS_PRESETS[initialPresetKey]?.terms || SERVICE_TERMS_PRESETS['bridal-makeup'].terms;
    return presetFn(initialAdvance, Math.max(0, totalAmount - initialAdvance));
  });

  // Admin edit mode toggle
  const [isEditMode, setIsEditMode] = useState(false);
  const [activePreset, setActivePreset] = useState(initialPresetKey);

  // Quick payment update state
  const [paymentStatus, setPaymentStatus] = useState(booking.paymentStatus || (advanceAmount >= totalAmount ? 'Paid' : 'Confirmed'));
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod || 'Paytm UPI');
  const [utrNumber, setUtrNumber] = useState(booking.utrNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  // When preset is selected, auto-update terms
  const applyPreset = (key) => {
    setActivePreset(key);
    const preset = SERVICE_TERMS_PRESETS[key];
    if (preset) {
      setInclusionsText(preset.defaultInclusions);
      setTermsList(preset.terms(advanceAmount, balanceDue));
      if (showToast) showToast(`Applied ${preset.name} terms preset!`);
    }
  };

  // Recalculate terms when amounts change
  const handleAdvanceChange = (newAdvance) => {
    const adv = Number(newAdvance) || 0;
    setAdvanceAmount(adv);
    const newBal = Math.max(0, totalAmount - adv);
    setTermsList(prev => prev.map((t, idx) => {
      if (idx === 0 && t.includes('advance payment of')) {
        return `The advance payment of ₹${adv.toLocaleString('en-IN')} is strictly non-refundable and non-transferable.`;
      }
      if (idx === 1 && t.includes('remaining balance of')) {
        return `The remaining balance of ₹${newBal.toLocaleString('en-IN')} must be paid immediately upon completion of the service.`;
      }
      return t;
    }));
  };

  // Handler for item discount update inside invoice edit mode
  const handleItemDiscountChange = (idx, discountVal) => {
    setInvoiceItems(prev => {
      return prev.map((item, i) => {
        if (i !== idx) return item;
        const orig = Number(item.originalPrice !== undefined ? item.originalPrice : item.price) || 0;
        const disc = Math.min(orig, Math.max(0, Number(discountVal) || 0));
        const discPct = orig > 0 ? Math.round((disc / orig) * 100) : 0;
        const net = Math.max(0, orig - disc);
        return {
          ...item,
          originalPrice: orig,
          discount: disc,
          discountPercent: discPct,
          price: net
        };
      });
    });
  };

  // Add / Remove / Edit term item
  const handleTermChange = (index, val) => {
    const updated = [...termsList];
    updated[index] = val;
    setTermsList(updated);
  };

  const handleAddTerm = () => {
    setTermsList([...termsList, 'New terms & conditions clause.']);
  };

  const handleRemoveTerm = (index) => {
    setTermsList(termsList.filter((_, i) => i !== index));
  };

  // Save customizations for this booking to backend
  const handleSaveCustomization = async () => {
    setIsSaving(true);
    try {
      const gross = invoiceItems.reduce((acc, it) => acc + (Number(it.originalPrice !== undefined ? it.originalPrice : it.price) || 0), 0);
      const disc = invoiceItems.reduce((acc, it) => acc + (Number(it.discount) || 0), 0);
      const net = Math.max(0, gross - disc);

      const payload = {
        invoiceTitle,
        invoiceDate,
        invoiceTime,
        advanceAmount,
        balanceAmount: Math.max(0, net - advanceAmount),
        inclusionsText,
        terms: termsList,
        presetKey: activePreset,
        items: invoiceItems,
        subtotal: gross,
        itemDiscount: disc,
        totalAmount: net,
        total: net,
        paymentStatus,
        paymentMethod,
        utrNumber
      };

      const res = await fetch(`/api/bookings/${booking.id}/invoice-customization`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (onUpdatePayment) {
          onUpdatePayment(booking.id, {
            invoiceCustomization: payload,
            items: invoiceItems,
            services: invoiceItems.map(it => it.name),
            subtotal: gross,
            itemDiscount: disc,
            total: net,
            paidAmount: advanceAmount,
            paymentStatus,
            paymentMethod,
            utrNumber
          });
        }
        setIsEditMode(false);
        if (showToast) showToast('Invoice terms & customizations saved successfully!');
      } else {
        if (showToast) showToast('Failed to save customization.');
      }
    } catch (err) {
      if (showToast) showToast('Error saving invoice customizations.');
    } finally {
      setIsSaving(false);
    }
  };

  // Print Handler (Single-Page A4 Guaranteed Fit)
  const handlePrint = () => {
    const el = document.getElementById('officialInvoiceContainer');
    if (!el) return;
    const printWin = window.open('', '_blank', 'width=850,height=1000');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${invoiceTitle} - ${booking.guestName}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { 
              size: A4 portrait; 
              margin: 4mm 6mm; 
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body { 
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
              color: #1a1a1a;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }
            .gold-border { border: 1.5px solid #b38728; }
            .gold-text { color: #b38728; }
            .gold-bg { background-color: #f7eedb; }
            .gold-divider { height: 1.5px; background-color: #b38728; }
            #officialInvoiceContainer {
              border: 1.5px solid #b38728 !important;
              border-radius: 12px !important;
              box-shadow: none !important;
              padding: 12px 18px !important;
              margin: 0 auto !important;
              width: 100% !important;
              max-width: 100% !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0 !important; margin: 0 !important; }
            }
          </style>
        </head>
        <body class="p-1">
          ${el.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // WhatsApp Share
  const handleWhatsAppShare = () => {
    const servicesText = invoiceItems.map(it => {
      const orig = Number(it.originalPrice !== undefined ? it.originalPrice : it.price) || 0;
      const disc = Number(it.discount) || 0;
      const net = Number(it.price !== undefined ? it.price : orig - disc) || 0;
      if (disc > 0) {
        return `• ${it.name}: ₹${net.toLocaleString('en-IN')} (Reg: ~₹${orig.toLocaleString('en-IN')}~, Save ₹${disc.toLocaleString('en-IN')})`;
      }
      return `• ${it.name}: ₹${net.toLocaleString('en-IN')}`;
    }).join('\n');

    const msg = `🌸 *SERENE SALON & ACADEMY VADODARA* 🌸\n` +
      `*${invoiceTitle}*\n` +
      `BEAUTY • MAKEUP • PROFESSIONAL SERVICES (CIDESCO Certified)\n` +
      `----------------------------------------\n` +
      `👤 *Client:* ${booking.guestName} (${booking.guestPhone})\n` +
      `🧾 *Invoice Number:* #${booking.id}\n` +
      `📅 *Billed On:* ${invoiceDate} ${invoiceTime}\n` +
      `💆‍♀️ *Services & Products Billed:*\n` +
      `${servicesText}\n` +
      `📦 *Inclusions & Protocol:* ${inclusionsText}\n` +
      `----------------------------------------\n` +
      `💰 *Total Services Amount:* ₹${grossServicesAmount.toLocaleString('en-IN')}\n` +
      (totalItemDiscounts > 0 ? `🏷️ *Item Discounts Applied:* -₹${totalItemDiscounts.toLocaleString('en-IN')}\n` : '') +
      `💵 *Net Invoiced Total:* ₹${totalAmount.toLocaleString('en-IN')}\n` +
      `✅ *Advance Payment Received:* ₹${advanceAmount.toLocaleString('en-IN')}\n` +
      `💳 *Balance Payment Due:* ₹${balanceDue.toLocaleString('en-IN')}\n` +
      `----------------------------------------\n` +
      `📝 *Terms & Conditions:*\n` +
      `• Thank you for visiting Serene Salon & Academy. Services, Products and Memberships once sold cannot be refunded, exchanged or transferred.\n` +
      termsList.slice(1, 4).map(t => `• ${t}`).join('\n') + `\n\n` +
      `✨ *Stay connected with Serene Salon & Academy!*\n` +
      `Follow our WhatsApp and Instagram channels to receive the latest updates on exclusive offers, special promotions, new services, beauty trends and exciting announcements.\n\n` +
      `Don't miss out on our latest offers! 💖\n\n` +
      `📍 *Address:* FF 16, Ramma Emperro, Makarpura Road, Beside Kabir Complex, Manjalpur, Vadodara\n` +
      `📸 *Instagram:* @serenesalonacademy\n` +
      `📞 *WhatsApp:* +91 6203060789`;

    const phone = (booking.guestPhone || '').replace(/\D/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-espresso-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-champagne-300 flex flex-col max-h-[96vh] overflow-hidden animate-scale-up">
        
        {/* Top Control Bar (No-Print) */}
        <div className="bg-espresso-950 text-white px-5 py-3 flex items-center justify-between border-b border-champagne-800/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-champagne-600 flex items-center justify-center text-espresso-950 font-bold text-sm shadow">
              📄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-base sm:text-lg font-bold text-champagne-100">
                  {invoiceTitle}
                </span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  balanceDue === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  advanceAmount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {balanceDue === 0 ? 'Settled in Full' : advanceAmount > 0 ? `Advance Paid (Due: ₹${balanceDue.toLocaleString('en-IN')})` : 'Pending'}
                </span>
              </div>
              <span className="text-[10px] text-champagne-300/70">
                Client: {booking.guestName} • Booking #{booking.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Edit Terms & Details Button (Admin Only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsEditMode(!isEditMode)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-xs ${
                  isEditMode
                    ? 'bg-amber-500 text-espresso-950 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-champagne-200 border border-champagne-700/60'
                }`}
                title="Edit Terms & Conditions, Advance & Inclusions Service-Wise"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Done Editing' : 'Edit Terms ✏️'}</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-champagne-500 hover:bg-champagne-400 text-espresso-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
              title="Print Official Invoice (A4 Layout)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
              title="Share formatted invoice on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Admin Inline Terms & Service Customizer (When toggled) */}
        {isAdmin && isEditMode && (
          <div className="bg-amber-50/90 border-b-2 border-amber-300 p-4 sm:p-5 space-y-4 max-h-72 overflow-y-auto shrink-0 text-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-bold text-espresso-950 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Service-Wise Terms & Invoice Customizer</span>
                </span>
                <p className="text-[11px] text-slate-600">
                  Change invoice heading, reporting times, advance payments, and customize terms for this exact client.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveCustomization}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1 shadow transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save for this Booking'}</span>
                </button>
              </div>
            </div>

            {/* Quick Presets Picker */}
            <div>
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Load Preset Terms by Service Category:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(SERVICE_TERMS_PRESETS).map(([k, p]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => applyPreset(k)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                      activePreset === k
                        ? 'bg-espresso-900 text-champagne-200 font-bold shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Details Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Invoice Heading</label>
                <input 
                  type="text" 
                  value={invoiceTitle}
                  onChange={(e) => setInvoiceTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Advance Received (₹)</label>
                <input 
                  type="number" 
                  value={advanceAmount}
                  onChange={(e) => handleAdvanceChange(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inclusions / Products</label>
                <input 
                  type="text" 
                  value={inclusionsText}
                  onChange={(e) => setInclusionsText(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Invoice Date</label>
                <input 
                  type="text" 
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  placeholder="e.g. 2026-11-14 or 14 Nov 2026"
                  className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Invoice Time</label>
                <input 
                  type="text" 
                  value={invoiceTime}
                  onChange={(e) => setInvoiceTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="w-full text-xs rounded-lg border border-slate-300 py-1.5 px-2.5 bg-white"
                />
              </div>
            </div>

            {/* Item-Specific Discounts Customizer (in Edit Mode) */}
            {invoiceItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Item-Specific Discounts ({invoiceItems.length} items):
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">Adjust discounts per service below</span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {invoiceItems.map((item, idx) => {
                    const orig = Number(item.originalPrice !== undefined ? item.originalPrice : item.price) || 0;
                    const disc = Number(item.discount) || 0;
                    const net = Math.max(0, orig - disc);

                    return (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-amber-200 text-xs">
                        <div className="flex-1 truncate">
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">Rate: ₹{orig}</span>
                          {disc > 0 && (
                            <span className="text-[10px] text-emerald-700 font-bold ml-1">• Net: ₹{net}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-600">Disc ₹:</span>
                          <input 
                            type="number"
                            min="0"
                            max={orig}
                            value={item.discount || ''}
                            onChange={(e) => handleItemDiscountChange(idx, e.target.value)}
                            placeholder="0"
                            className="w-16 text-xs font-mono font-bold rounded border border-slate-300 py-0.5 px-1.5 bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Terms List Editor */}
            <div className="space-y-2 pt-1 border-t border-amber-200">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Edit Numbered Terms & Conditions Clauses ({termsList.length}):
                </label>
                <button
                  type="button"
                  onClick={handleAddTerm}
                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Custom Term</span>
                </button>
              </div>

              <div className="space-y-2">
                {termsList.map((term, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-amber-200 shadow-xs">
                    <span className="font-bold text-slate-400 mt-1 text-[11px] w-4">{idx + 1}.</span>
                    <textarea 
                      rows={2}
                      value={term}
                      onChange={(e) => handleTermChange(idx, e.target.value)}
                      className="flex-1 text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1 mt-1"
                      title="Remove term"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Printable Official Invoice Body (Authentic Owner PDF Layout - Guaranteed Single Page A4 Fit) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100/60">
          <div 
            id="officialInvoiceContainer" 
            className="p-4 sm:p-5 bg-white text-slate-900 border-2 border-[#b38728] shadow-2xl rounded-2xl max-w-2xl mx-auto space-y-3 text-xs leading-normal"
          >
            {/* 1. Header (Centered Gold Branding & CIDESCO Tagline - No Rashmis) */}
            <div className="text-center pb-0.5">
              <div className="flex justify-center mb-1">
                <img 
                  src={invoiceSettings?.logoUrl || '/images/serene-logo.png'} 
                  alt="Serene Salon & Academy Logo" 
                  className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-full p-0.5 bg-white border border-[#b38728]/40 shadow-xs"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <h1 className="font-editorial text-2xl sm:text-2xl font-extrabold tracking-wider text-[#b38728] uppercase">
                SERENE SALON & ACADEMY
              </h1>
              <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-800 uppercase mt-0.5">
                BEAUTY • MAKEUP • PROFESSIONAL SERVICES (CIDESCO Certified)
              </p>
              <p className="text-[9px] sm:text-[9.5px] text-slate-600 mt-0.5">
                Address: FF 16, Ramma Emperro, Makarpura Road, Beside Kabir Complex, Manjalpur, Vadodara
              </p>
              <div className="w-full h-0.5 bg-[#b38728] my-1.5"></div>
            </div>

            {/* 2. Invoice Document Title */}
            <div className="text-center py-0.5">
              <h2 className="font-editorial text-base sm:text-lg font-extrabold tracking-wide text-slate-900 uppercase">
                {invoiceTitle}
              </h2>
            </div>

            {/* 3. Client Details & Invoice Details (Matching Salon POS Receipt) */}
            <div className="border border-[#e6d5b8] rounded-xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 bg-[#fbf6ec] border-b border-[#e6d5b8] px-3 py-1 font-bold text-[10px] uppercase tracking-wider text-[#996b1b]">
                <div>CLIENT DETAILS</div>
                <div>INVOICE & BILLING DETAILS</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 text-[11px] bg-[#fdfbf7]">
                <div className="space-y-0.5">
                  <div><strong>Name:</strong> <span>{booking.guestName}</span></div>
                  <div><strong>Contact:</strong> <span className="font-mono">{booking.guestPhone}</span></div>
                  {cleanNotes && (
                    <div className="text-[10px] text-slate-600 italic pt-0.5">Note: {cleanNotes}</div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div><strong>Invoice Number:</strong> <span className="font-mono font-bold text-slate-900">#{booking.id}</span></div>
                  <div><strong>Billed On:</strong> <span className="font-semibold text-slate-900">{invoiceDate} {invoiceTime}</span></div>
                </div>
              </div>
            </div>

            {/* 4. Service Details Section */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[10px] uppercase tracking-wider text-[#996b1b]">
                  SERVICE DETAILS {invoiceItems.length > 1 && `(${invoiceItems.length} SERVICES / PRODUCTS)`}
                </h3>
                {totalItemDiscounts > 0 && (
                  <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Total Privilege Discount: -₹{totalItemDiscounts.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#181210] text-white text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-1 px-3 w-5/12">Service / Product Details</th>
                      <th className="py-1 px-3 w-4/12">Inclusions / Products Used</th>
                      <th className="py-1 px-3 w-3/12 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {invoiceItems.map((item, idx) => {
                      const hasDiscount = (Number(item.discount) || 0) > 0;
                      const origPrice = Number(item.originalPrice !== undefined ? item.originalPrice : item.price) || 0;
                      const netPrice = Number(item.price !== undefined ? item.price : origPrice - (Number(item.discount) || 0)) || 0;
                      const discVal = Number(item.discount) || 0;
                      const discPct = item.discountPercent || (origPrice > 0 ? Math.round((discVal / origPrice) * 100) : 0);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition">
                          <td className="py-1.5 px-3 align-top">
                            <div className="font-bold text-slate-900 leading-snug">{item.name}</div>
                            {hasDiscount && (
                              <div className="text-[9px] font-semibold text-emerald-700 mt-0.5 inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <Tag className="w-2.5 h-2.5" />
                                <span>Privilege Disc: -₹{discVal.toLocaleString('en-IN')}</span>
                                {discPct > 0 && <span className="opacity-80">({discPct}% off)</span>}
                              </div>
                            )}
                          </td>
                          <td className="py-1.5 px-3 text-slate-700 align-top leading-snug text-[10px]">
                            {item.inclusions || inclusionsText}
                          </td>
                          <td className="py-1.5 px-3 text-right align-top whitespace-nowrap">
                            {hasDiscount ? (
                              <div>
                                <span className="line-through text-slate-400 text-[9.5px] mr-1.5 font-mono">
                                  ₹{origPrice.toLocaleString('en-IN')}
                                </span>
                                <span className="font-bold font-mono text-slate-900 text-xs">
                                  ₹{netPrice.toLocaleString('en-IN')}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold font-mono text-slate-900 text-xs">
                                ₹{netPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Payment Summary Section */}
            <div className="space-y-1">
              <h3 className="font-bold text-[10px] uppercase tracking-wider text-[#996b1b]">
                PAYMENT SUMMARY
              </h3>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-[#181210] text-white text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-1 px-3 w-2/3">Description</th>
                      <th className="py-1 px-3 w-1/3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    <tr>
                      <td className="py-1 px-3 text-slate-800">
                        Total Services Amount (Gross)
                        {invoiceItems.length > 1 && (
                          <span className="text-[10px] text-slate-500 ml-1">
                            ({invoiceItems.length} items)
                          </span>
                        )}
                      </td>
                      <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{grossServicesAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {totalItemDiscounts > 0 && (
                      <tr className="bg-emerald-50/40">
                        <td className="py-1 px-3 text-emerald-800 font-medium">
                          Item-Specific Discounts Applied
                        </td>
                        <td className="py-1 px-3 text-right font-mono font-bold text-emerald-700">
                          -₹{totalItemDiscounts.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                    {Number(booking.discount) > totalItemDiscounts && (
                      <tr className="bg-emerald-50/40">
                        <td className="py-1 px-3 text-emerald-800 font-medium">
                          Promotional Privilege Code ({booking.promoCode})
                        </td>
                        <td className="py-1 px-3 text-right font-mono font-bold text-emerald-700">
                          -₹{(Number(booking.discount) - totalItemDiscounts).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                    {(totalItemDiscounts > 0 || (Number(booking.discount) > totalItemDiscounts)) && (
                      <tr className="font-bold bg-slate-50/80">
                        <td className="py-1 px-3 text-slate-900">Net Invoiced Total</td>
                        <td className="py-1 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{totalAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-1 px-3 text-slate-800">Advance / Payment Received</td>
                      <td className="py-1 px-3 text-right font-mono font-bold text-emerald-800">
                        ₹{advanceAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-[#f7eedb] font-bold text-slate-900">
                      <td className="py-1.5 px-3 text-xs font-extrabold text-[#7a5412]">Balance Payment Due</td>
                      <td className="py-1.5 px-3 text-right font-mono text-sm font-extrabold text-[#7a5412]">
                        ₹{balanceDue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[9.5px] text-slate-600 italic pt-0.5">
                The remaining balance of <strong>₹{balanceDue.toLocaleString('en-IN')}</strong> is payable immediately upon completion of the service.
              </p>
            </div>

            {/* 6. Terms & Conditions Section (Service-Wise Dynamic) */}
            <div className="space-y-0.5 pt-0.5">
              <h3 className="font-bold text-[10px] uppercase tracking-wider text-[#996b1b]">
                TERMS & CONDITIONS
              </h3>
              <ol className="list-decimal pl-4 space-y-0.5 text-[9.5px] text-slate-700 leading-snug">
                {termsList.map((term, idx) => (
                  <li key={idx} className="pl-0.5">{term}</li>
                ))}
              </ol>
            </div>

            {/* 7. Thank You Note & Stay Connected Section (Official Owner Requirement) */}
            <div className="pt-1.5 space-y-1.5">
              <div className="bg-[#fbf6ec] border border-[#e6d5b8] rounded-xl p-2.5 text-center space-y-1 shadow-xs">
                <p className="font-editorial text-xs font-bold text-[#996b1b]">
                  Stay connected with Serene Salon & Academy!
                </p>
                <p className="text-[9.5px] text-slate-700 leading-tight max-w-lg mx-auto">
                  Follow our WhatsApp and Instagram channels to receive the latest updates on exclusive offers, special promotions, new services, beauty trends and exciting announcements.
                </p>
                <p className="text-[9.5px] font-bold text-pink-700">
                  Don't miss out on our latest offers! 💖
                </p>
                <div className="flex items-center justify-center gap-3 pt-0.5 text-[9.5px] font-semibold text-slate-800 flex-wrap">
                  <a 
                    href="https://www.instagram.com/serenesalonacademy/?hl=en" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline text-pink-700"
                  >
                    📸 Instagram: @serenesalonacademy
                  </a>
                  <span>•</span>
                  <a 
                    href="https://wa.me/916203060789" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline text-emerald-700"
                  >
                    💬 WhatsApp: +91 6203060789
                  </a>
                </div>
              </div>

              <div className="w-full h-0.5 bg-[#b38728] my-1"></div>

              {/* 8. Footer (Salon Name & Address - No Rashmis) */}
              <div className="text-center text-[9.5px] text-slate-600 space-y-0.5">
                <p className="font-bold tracking-widest uppercase text-slate-800">
                  Serene Salon & Academy
                </p>
                <p className="text-[9px] text-slate-500">
                  Address: FF 16, Ramma Emperro, Makarpura Road, Beside Kabir Complex, Manjalpur, Vadodara
                </p>
                <p className="text-[9px] text-slate-500">
                  For more information connect our Instagram ID: <strong className="text-slate-900">@serenesalonacademy</strong> or WhatsApp: <strong className="text-slate-900">+91 6203060789</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Payment Settlement Bar */}
        {isAdmin && (
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">Quick Balance Status:</span>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="rounded-lg border border-slate-300 py-1 px-2 text-xs font-semibold focus:ring-1 focus:ring-champagne-500"
              >
                <option value="Paid">🟢 Full Balance Paid (₹0 Due)</option>
                <option value="Confirmed">🟡 Advance Confirmed</option>
                <option value="Partial">🟠 Partial Advance</option>
                <option value="Pending">🔴 Payment Pending</option>
              </select>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="rounded-lg border border-slate-300 py-1 px-2 text-xs focus:ring-1 focus:ring-champagne-500"
              >
                <option value="Paytm UPI">Paytm UPI (6203060789@ptaxis)</option>
                <option value="Cash">Cash at Salon Sanctuary</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
              </select>

              <input 
                type="text"
                placeholder="UTR / Txn Ref..."
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="rounded-lg border border-slate-300 py-1 px-2 text-xs font-mono w-28 focus:ring-1 focus:ring-champagne-500"
              />

              <button
                type="button"
                onClick={handleSaveCustomization}
                disabled={isSaving}
                className="px-3 py-1 rounded-lg bg-espresso-900 hover:bg-espresso-950 text-champagne-200 font-bold transition shadow-xs"
              >
                {isSaving ? 'Updating...' : 'Update Balance & Save'}
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Balance: <strong>₹{balanceDue.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
