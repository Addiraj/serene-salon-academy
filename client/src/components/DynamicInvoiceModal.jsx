import React, { useState } from 'react';
import { 
  Printer, Share2, X, ShieldCheck, 
  Edit3, Save, RotateCcw, Plus, Trash2, CheckCircle2,
  Sparkles, Phone, MessageCircle
} from 'lucide-react';

// Preset Terms & Conditions by Service Category
const SERVICE_TERMS_PRESETS = {
  'bridal-makeup': {
    name: '💄 Bridal & Engagement Makeup',
    defaultInclusions: 'Makeup Studio Products with Hair Extension & Draping',
    terms: (adv, bal) => [
      `The advance payment of ₹${(adv || 0).toLocaleString('en-IN')} is strictly non-refundable and non-transferable.`,
      `The remaining balance of ₹${(bal || 0).toLocaleString('en-IN')} must be paid immediately upon completion of the service.`,
      `The booking is confirmed upon receipt of the advance payment.`,
      `The client is requested to arrive on time for the scheduled appointment.`,
      `Personal belongings, including jewellery, valuables and other items, must be kept safely by the client. Serene Salon & Academy will not be responsible for any loss or damage to personal belongings.`
    ]
  },
  'facials-clinical': {
    name: '💆‍♀️ Facials & Clinical Skin Rituals',
    defaultInclusions: 'Hospital-Grade Autoclaved Sealed Pouches Opened Live in Client Presence',
    terms: (adv, bal) => [
      `100% Hospital-grade autoclave sterilized single-use sealed medical pouches are opened live before treatment.`,
      `The client must disclose any active retinoids, AHA/BHA chemical peels, or dermatological conditions.`,
      `Direct sunlight, steam, and sauna should be avoided for 24-48 hours post-treatment.`,
      `The remaining balance of ₹${(bal || 0).toLocaleString('en-IN')} is payable immediately upon completion.`,
      `Appointments can be rescheduled with at least 4 hours advance notice.`
    ]
  },
  'hair-treatments': {
    name: '💇‍♀️ Hair Spa, Color & Smoothing',
    defaultInclusions: 'Authentic L’Oréal & Olaplex Professional Ampoules & Autoclaved Tools',
    terms: (adv, bal) => [
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
      `Authentic acrylic and gel formulas applied with sterile sanitized nail implements.`,
      `Any accidental lifting or stone repair within 48 hours is retouched complimentary at our sanctuary.`,
      `Avoid using nail extensions as tools or exposing them to harsh chemical cleaning agents.`,
      `Balance payment of ₹${(bal || 0).toLocaleString('en-IN')} is payable upon completion.`
    ]
  },
  'standard-salon': {
    name: '📜 Standard Sanctuary Policies',
    defaultInclusions: 'Sterile Station Allocation, Autoclaved Implements & Single-Use Linens',
    terms: (adv, bal) => [
      `All instruments are hospital-grade autoclave sterilized in single-use sealed medical pouches.`,
      `Appointments are reserved for the scheduled appointment time.`,
      `Payments once completed are non-refundable but adjustable for salon privilege credits.`,
      `For customer assistance or inquiries, please WhatsApp +91 6203060789.`
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
    return 'bridal-makeup'; // default to owner's sample invoice
  };

  const initialPresetKey = savedCustom.presetKey || inferPresetKey();

  // Default Invoice Document Title (Clean & official; no raw service names like "Signature Hydra facial" in header)
  const defaultTitle = savedCustom.invoiceTitle || (
    primaryServiceName.toLowerCase().includes('engagement') ? 'ENGAGEMENT MAKEUP BOOKING INVOICE' :
    primaryServiceName.toLowerCase().includes('bridal') ? 'BRIDAL MAKEUP BOOKING INVOICE' :
    'OFFICIAL BOOKING INVOICE'
  );

  const [invoiceTitle, setInvoiceTitle] = useState(defaultTitle);
  const [invoiceDate, setInvoiceDate] = useState(savedCustom.invoiceDate || booking.date || new Date().toISOString().split('T')[0]);
  const [invoiceTime, setInvoiceTime] = useState(savedCustom.invoiceTime || booking.time || '10:00 AM');

  // Sanitize notes: remove any "enrich" references or auto-generated strings
  const rawNotes = (booking.notes || '').trim();
  const cleanNotes = /enrich/i.test(rawNotes) 
    ? null 
    : (rawNotes.length > 0 ? rawNotes : null);
  
  // Advance & Balance
  const totalAmount = Number(booking.total) || 6400;
  const initialAdvance = savedCustom.advanceAmount !== undefined 
    ? Number(savedCustom.advanceAmount) 
    : (booking.paidAmount !== undefined ? Number(booking.paidAmount) : Math.round(totalAmount * 0.2));

  const [advanceAmount, setAdvanceAmount] = useState(initialAdvance);
  const balanceDue = Math.max(0, totalAmount - advanceAmount);

  // Inclusions description
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

  // Recalculate terms 1 & 2 when amounts change
  const handleAdvanceChange = (newAdvance) => {
    const adv = Number(newAdvance) || 0;
    setAdvanceAmount(adv);
    const newBal = Math.max(0, totalAmount - adv);
    // dynamically refresh terms list numbers for term 1 & 2 if they follow standard wording
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
      const payload = {
        invoiceTitle,
        invoiceDate,
        invoiceTime,
        advanceAmount,
        balanceAmount: balanceDue,
        inclusionsText,
        terms: termsList,
        presetKey: activePreset,
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

  // Print Handler
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
              size: A4; 
              margin: 10mm 12mm; 
            }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1a1a1a;
              background: #fff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .gold-border { border: 2px solid #b38728; }
            .gold-text { color: #b38728; }
            .gold-bg { background-color: #f7eedb; }
            .gold-divider { height: 2px; background-color: #b38728; }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0; margin: 0; }
            }
          </style>
        </head>
        <body class="p-6">
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
    const msg = `🌸 *SERENE SALON & ACADEMY VADODARA* 🌸\n` +
      `*${invoiceTitle}*\n` +
      `BEAUTY • MAKEUP • PROFESSIONAL SERVICES (CIDESCO Certified)\n` +
      `----------------------------------------\n` +
      `👤 *Client:* ${booking.guestName} (${booking.guestPhone})\n` +
      `🧾 *Invoice No:* #${booking.id}\n` +
      `📅 *Invoice Date:* ${invoiceDate}\n` +
      `⏰ *Invoice Time:* ${invoiceTime}\n` +
      `💆‍♀️ *Service:* ${primaryServiceName}\n` +
      `📦 *Inclusions:* ${inclusionsText}\n` +
      `----------------------------------------\n` +
      `💰 *Total Service Amount:* ₹${totalAmount.toLocaleString('en-IN')}\n` +
      `✅ *Advance Payment Received:* ₹${advanceAmount.toLocaleString('en-IN')}\n` +
      `💳 *Balance Payment Due:* ₹${balanceDue.toLocaleString('en-IN')}\n` +
      `----------------------------------------\n` +
      `📝 *Terms & Conditions:*\n` +
      termsList.slice(0, 3).map((t, i) => `${i + 1}. ${t}`).join('\n') + `\n\n` +
      `✨ *Thank you for choosing Serene Salon & Academy.*\n` +
      `*We look forward to welcoming you to our sanctuary!*\n\n` +
      `📍 *Location:* FF 16 Raama Emperro, Manjalpur, Vadodara\n` +
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

        {/* Printable Official Invoice Body (Authentic Owner PDF Layout) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/60">
          <div 
            id="officialInvoiceContainer" 
            className="p-8 sm:p-10 bg-white text-slate-900 border-2 border-[#b38728] shadow-2xl rounded-2xl max-w-2xl mx-auto space-y-6 text-xs leading-relaxed"
          >
            {/* 1. Header (Centered Gold Branding & CIDESCO Tagline) */}
            <div className="text-center pb-2">
              <div className="flex justify-center mb-2.5">
                <img 
                  src={invoiceSettings?.logoUrl || '/images/serene-logo.png'} 
                  alt="Serene Salon & Academy Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-full p-1 bg-white border border-[#b38728]/40 shadow-xs"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-extrabold tracking-wider text-[#b38728] uppercase">
                SERENE SALON & ACADEMY
              </h1>
              <p className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-800 uppercase mt-1">
                BEAUTY • MAKEUP • PROFESSIONAL SERVICES (CIDESCO Certified)
              </p>
              <div className="w-full h-0.5 bg-[#b38728] my-3"></div>
            </div>

            {/* 2. Invoice Document Title */}
            <div className="text-center py-1">
              <h2 className="font-editorial text-lg sm:text-xl font-extrabold tracking-wide text-slate-900 uppercase">
                {invoiceTitle}
              </h2>
            </div>

            {/* 3. Client Details & Invoice Details (Two-Column Beige Box - Clean Date/Time, No Occasion Date, No Enrich) */}
            <div className="border border-[#e6d5b8] rounded-xl overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 bg-[#fbf6ec] border-b border-[#e6d5b8] px-4 py-2 font-bold text-[11px] uppercase tracking-wider text-[#996b1b]">
                <div>CLIENT DETAILS</div>
                <div>INVOICE & BOOKING DETAILS</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 text-xs bg-[#fdfbf7]">
                <div className="space-y-1">
                  <div><strong>Name:</strong> <span>{booking.guestName}</span></div>
                  <div><strong>Contact:</strong> <span className="font-mono">{booking.guestPhone}</span></div>
                  {cleanNotes && (
                    <div className="text-[11px] text-slate-600 italic pt-0.5">Note: {cleanNotes}</div>
                  )}
                </div>

                <div className="space-y-1">
                  <div><strong>Invoice No:</strong> <span className="font-mono font-bold text-slate-900">#{booking.id}</span></div>
                  <div><strong>Invoice Date:</strong> <span className="font-semibold text-slate-900">{invoiceDate}</span></div>
                  <div><strong>Invoice Time:</strong> <span className="font-semibold text-slate-900">{invoiceTime}</span></div>
                </div>
              </div>
            </div>

            {/* 4. Service Details Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#996b1b]">
                SERVICE DETAILS
              </h3>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181210] text-white text-[11px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-4 w-1/2">Service Details</th>
                      <th className="py-2.5 px-4 w-1/2">Inclusions / Products Used</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {primaryServiceName}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {inclusionsText}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Payment Summary Section */}
            <div className="space-y-2">
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#996b1b]">
                PAYMENT SUMMARY
              </h3>
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181210] text-white text-[11px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-4 w-2/3">Description</th>
                      <th className="py-2.5 px-4 w-1/3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-4 text-slate-800">Total Service Amount</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-slate-800">Advance Payment Received</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800">
                        ₹{advanceAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-[#f7eedb] font-bold text-slate-900">
                      <td className="py-3 px-4 text-sm font-extrabold text-[#7a5412]">Balance Payment Due</td>
                      <td className="py-3 px-4 text-right font-mono text-base font-extrabold text-[#7a5412]">
                        ₹{balanceDue.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-600 italic pt-0.5">
                The remaining balance of <strong>₹{balanceDue.toLocaleString('en-IN')}</strong> is payable immediately upon completion of the service.
              </p>
            </div>

            {/* 6. Terms & Conditions Section (Service-Wise Dynamic) */}
            <div className="space-y-2 pt-1">
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-[#996b1b]">
                TERMS & CONDITIONS
              </h3>
              <ol className="list-decimal pl-5 space-y-1.5 text-[11px] text-slate-700 leading-relaxed">
                {termsList.map((term, idx) => (
                  <li key={idx} className="pl-1">{term}</li>
                ))}
              </ol>
            </div>

            {/* 7. Thank You Note & Closing Greeting */}
            <div className="text-center pt-4 space-y-1 text-slate-700 italic text-xs">
              <p className="font-medium">Thank you for choosing Serene Salon & Academy.</p>
              <p className="font-medium text-[#996b1b]">We look forward to welcoming you to our sanctuary!</p>
              <div className="w-full h-0.5 bg-[#b38728] mt-3 mb-2"></div>
            </div>

            {/* 8. Footer (Instagram ID & WhatsApp Number) */}
            <div className="text-center pt-1 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold">
                For more information connect our Instagram ID: <strong className="text-slate-900">@serenesalonacademy</strong> or WhatsApp: <strong className="text-slate-900">+91 6203060789</strong>
              </p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 pt-1">
                SERENE SALON & ACADEMY
              </p>
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
