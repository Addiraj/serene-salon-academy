import React, { useRef, useState } from 'react';
import { 
  Printer, Download, Share2, X, CheckCircle2, ShieldCheck, 
  QrCode, FileText, Check, AlertCircle, Sparkles, Phone, 
  MapPin, Mail, Globe, Clock, User, Scissors
} from 'lucide-react';

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
  const [selectedTheme, setSelectedTheme] = useState(invoiceSettings.theme || 'royal-champagne');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [paymentInput, setPaymentInput] = useState({
    status: booking?.paymentStatus || 'Paid',
    method: booking?.paymentMethod || 'Paytm UPI',
    utrNumber: booking?.utrNumber || ''
  });

  if (!isOpen || !booking) return null;

  // Resolved invoice settings with rock-solid defaults
  const cfg = {
    businessName: invoiceSettings.businessName || 'Serene Salon & Academy',
    tagline: invoiceSettings.tagline || 'Where Clinical Hygiene Meets Couture Beauty & Mastery',
    logoUrl: invoiceSettings.logoUrl || '/images/serene-logo.png',
    addressLine1: invoiceSettings.addressLine1 || 'First Floor 16, Raama Emperro',
    addressLine2: invoiceSettings.addressLine2 || 'Opp. Shell Petrol Pump, Makarpura Industrial Estate, Manjalpur',
    city: invoiceSettings.city || 'Vadodara',
    state: invoiceSettings.state || 'Gujarat',
    pincode: invoiceSettings.pincode || '390010',
    phone: invoiceSettings.phone || '+91 6203060789',
    whatsapp: invoiceSettings.whatsapp || '916203060789',
    email: invoiceSettings.email || 'contact@serenesalonacademy.com',
    website: invoiceSettings.website || 'https://serene-salon-academy-nine.vercel.app',
    gstin: invoiceSettings.gstin || '24ABCDE1234F1Z5',
    enableGst: invoiceSettings.enableGst !== false,
    taxPercent: Number(invoiceSettings.taxPercent) || 18,
    taxMode: invoiceSettings.taxMode || 'inclusive',
    invoicePrefix: invoiceSettings.invoicePrefix || 'SSA-INV-',
    theme: selectedTheme,
    showSterilizationBadge: invoiceSettings.showSterilizationBadge !== false,
    sterilizationBadgeText: invoiceSettings.sterilizationBadgeText || '✓ 100% Autoclaved Sealed Pouches Opened Live in Front of Client',
    showQrCode: invoiceSettings.showQrCode !== false,
    qrUpiId: invoiceSettings.qrUpiId || '6203060789@ptaxis',
    qrPayeeName: invoiceSettings.qrPayeeName || 'RASHMI KUMARI',
    showSignatory: invoiceSettings.showSignatory !== false,
    signatoryTitle: invoiceSettings.signatoryTitle || 'Founder & Master Educator',
    signatoryName: invoiceSettings.signatoryName || 'Rashmi Sah',
    thankYouNote: invoiceSettings.thankYouNote || 'Thank you for visiting Serene Salon & Academy! Where Clinical Hygiene Meets Couture Beauty.',
    terms: Array.isArray(invoiceSettings.terms) && invoiceSettings.terms.length > 0 ? invoiceSettings.terms : [
      'All instruments are hospital-grade autoclave sterilized in single-use sealed medical pouches.',
      'Appointments can be rescheduled with at least 4 hours advance notice.',
      'Billed treatments are non-refundable but adjustable for salon privileges and gift credits.',
      'For customer assistance or bridal consultations, please WhatsApp +91 6203060789.'
    ],
    customFooterNote: invoiceSettings.customFooterNote || 'Follow us on Instagram: @serenesalonacademy • Manjalpur, Vadodara'
  };

  const invoiceNum = `${cfg.invoicePrefix}${String(booking.id).replace(/\D/g, '') || booking.id}`;

  // Match line items
  const lineItems = (booking.services || []).map((sName, idx) => {
    const match = (services || []).find(
      s => s.name && s.name.toLowerCase().trim() === String(sName).toLowerCase().trim()
    );
    return {
      id: idx + 1,
      name: sName,
      category: match ? match.category : 'Salon Ritual',
      price: match ? Number(match.price) || 0 : 0,
      duration: match ? match.duration : 45,
      hygieneNote: match?.hygieneNote || 'Autoclaved Sealed Pouches Opened Live'
    };
  });

  const grandTotal = Number(booking.total) || 0;
  const isTaxInclusive = cfg.taxMode === 'inclusive';
  let taxableAmount = grandTotal;
  let cgst = 0;
  let sgst = 0;
  let subtotal = grandTotal;

  if (cfg.enableGst && cfg.taxPercent > 0) {
    if (isTaxInclusive) {
      taxableAmount = Math.round((grandTotal / (1 + cfg.taxPercent / 100)) * 100) / 100;
      const gstTotal = grandTotal - taxableAmount;
      cgst = Math.round((gstTotal / 2) * 100) / 100;
      sgst = Math.round((gstTotal / 2) * 100) / 100;
      subtotal = taxableAmount;
    } else {
      const gstTotal = Math.round((grandTotal * (cfg.taxPercent / 100)) * 100) / 100;
      cgst = Math.round((gstTotal / 2) * 100) / 100;
      sgst = Math.round((gstTotal / 2) * 100) / 100;
      subtotal = grandTotal;
    }
  }

  // Print handler
  const handlePrint = () => {
    const el = document.getElementById('printableInvoiceContainer');
    if (!el) return;
    const printWin = window.open('', '_blank', 'width=800,height=900');
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNum}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 12mm; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #1a1a1a;
              background: #fff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
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

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const msg = `🌸 *SERENE SALON & ACADEMY VADODARA* 🌸\n` +
      `*Official Tax Invoice / Receipt: #${invoiceNum}*\n` +
      `----------------------------------------\n` +
      `👤 *Client:* ${booking.guestName}\n` +
      `📅 *Date & Slot:* ${booking.date} at ${booking.time}\n` +
      `💇‍♀️ *Stylist:* ${booking.stylist}\n` +
      `💆‍♀️ *Services:* ${(booking.services || []).join(', ')}\n` +
      `💰 *Total Bill:* ₹${grandTotal.toLocaleString('en-IN')}\n` +
      `💳 *Payment Status:* ${booking.paymentStatus || 'Confirmed'} ${booking.utrNumber ? `(UTR: ${booking.utrNumber})` : ''}\n` +
      `✓ *Sterilization:* 100% Autoclaved Sealed Pouches\n` +
      `----------------------------------------\n` +
      `📍 *Location:* FF 16 Raama Emperro, Manjalpur, Vadodara\n` +
      `📞 *Helpdesk:* +91 6203060789\n` +
      `🌐 *View Portal:* https://serene-salon-academy-nine.vercel.app`;
    
    const phone = (booking.guestPhone || '').replace(/\D/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Admin Payment Update
  const handleSavePaymentStatus = async () => {
    if (!onUpdatePayment) return;
    try {
      await onUpdatePayment(booking.id, paymentInput);
      setIsUpdatingPayment(false);
      if (showToast) showToast('Invoice payment status updated successfully!');
    } catch (err) {
      if (showToast) showToast('Failed to update payment status.');
    }
  };

  // Theme-specific styling classes
  const getThemeWrapperClass = () => {
    switch (selectedTheme) {
      case 'modern-minimal':
        return 'bg-white text-slate-900 border-2 border-slate-900 shadow-xl';
      case 'clinical-emerald':
        return 'bg-gradient-to-b from-emerald-50/40 via-white to-white text-slate-900 border-2 border-emerald-600 shadow-xl';
      case 'thermal-pos':
        return 'bg-amber-50/30 text-slate-900 font-mono border border-slate-300 max-w-sm mx-auto shadow-md p-4 text-[11px]';
      case 'royal-champagne':
      default:
        return 'bg-gradient-to-b from-[#fdfbf7] via-white to-[#fbf8f1] text-espresso-950 border-2 border-champagne-400 shadow-2xl';
    }
  };

  const getHeaderBadgeClass = () => {
    switch (selectedTheme) {
      case 'modern-minimal':
        return 'bg-slate-900 text-white';
      case 'clinical-emerald':
        return 'bg-emerald-700 text-white';
      case 'thermal-pos':
        return 'bg-black text-white font-mono';
      case 'royal-champagne':
      default:
        return 'bg-gradient-to-r from-espresso-950 to-espresso-900 text-champagne-300 border border-champagne-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-espresso-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-champagne-300 flex flex-col max-h-[94vh] overflow-hidden animate-scale-up">
        
        {/* Top Modal Controls Toolbar (No-Print) */}
        <div className="bg-espresso-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-champagne-800/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg bg-champagne-600 flex items-center justify-center text-espresso-950 font-bold text-sm shadow">
              📄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-lg font-bold text-champagne-100">Tax Invoice #{invoiceNum}</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  booking.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  booking.paymentStatus === 'Partial' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {booking.paymentStatus || 'Pending'}
                </span>
              </div>
              <span className="text-[10px] text-champagne-300/70">Client: {booking.guestName} • {booking.date}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Theme Switcher */}
            <div className="hidden sm:flex items-center bg-espresso-900 rounded-xl p-0.5 border border-champagne-700/50 text-[11px]">
              {[
                { id: 'royal-champagne', label: '👑 Royal' },
                { id: 'modern-minimal', label: '⬛ Minimal' },
                { id: 'clinical-emerald', label: '🌿 Clinical' },
                { id: 'thermal-pos', label: '🧾 POS' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`px-2 py-1 rounded-lg transition font-medium ${
                    selectedTheme === t.id
                      ? 'bg-champagne-500 text-espresso-950 font-bold shadow'
                      : 'text-champagne-200 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-champagne-500 hover:bg-champagne-400 text-espresso-950 font-bold text-xs flex items-center gap-1.5 shadow transition"
              title="Print Tax Invoice (A4 / Thermal)"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
              title="Share Invoice on WhatsApp"
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

        {/* Printable Invoice Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div 
            id="printableInvoiceContainer" 
            className={`p-6 sm:p-8 rounded-2xl ${getThemeWrapperClass()} transition-all duration-200`}
          >
            {/* Header / Brand Details */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-champagne-300 pb-5">
              <div className="flex items-start gap-3.5">
                {cfg.logoUrl ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-white border border-champagne-300 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                    <img 
                      src={cfg.logoUrl} 
                      alt={cfg.businessName} 
                      className="w-full h-full object-contain"
                      onError={(e) => { e.currentTarget.src = '/images/serene-logo.png'; }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-espresso-950 text-champagne-300 font-serif font-bold text-2xl flex items-center justify-center shadow">
                    S
                  </div>
                )}
                <div>
                  <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-espresso-950 leading-tight">
                    {cfg.businessName}
                  </h1>
                  <p className="text-xs text-champagne-800 font-medium mt-0.5 italic">
                    {cfg.tagline}
                  </p>
                  <div className="text-[11px] text-slate-600 mt-1 space-y-0.5 leading-relaxed">
                    <p>{cfg.addressLine1}, {cfg.addressLine2}</p>
                    <p>{cfg.city}, {cfg.state} - {cfg.pincode} • Phone: {cfg.phone}</p>
                    {cfg.enableGst && cfg.gstin && (
                      <p className="font-mono text-slate-800 font-semibold pt-0.5">
                        GSTIN: <span>{cfg.gstin}</span> (State Code: 24 - Gujarat)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Meta Tag */}
              <div className="sm:text-right flex flex-col sm:items-end justify-between">
                <div className={`inline-block px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs ${getHeaderBadgeClass()}`}>
                  Official Tax Invoice
                </div>
                <div className="text-xs space-y-1 mt-2 sm:mt-0">
                  <div className="font-mono text-sm font-bold text-espresso-950">
                    #{invoiceNum}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Date: <strong className="text-slate-800">{booking.date}</strong>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Time: <strong className="text-slate-800">{booking.time}</strong>
                  </div>
                  {booking.createdAt && (
                    <div className="text-slate-400 text-[10px]">
                      Issued: {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Billed To / Specialist Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 p-4 rounded-xl bg-champagne-50/70 border border-champagne-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-champagne-800 block mb-1">
                  Billed To (Guest Details)
                </span>
                <div className="font-bold text-sm text-espresso-950">{booking.guestName}</div>
                <div className="font-mono text-slate-600">{booking.guestPhone}</div>
                {booking.notes && (
                  <div className="text-[11px] text-slate-500 mt-1 italic">
                    Note: {booking.notes}
                  </div>
                )}
              </div>

              <div className="sm:text-right border-t sm:border-t-0 border-champagne-200 pt-2 sm:pt-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-champagne-800 block mb-1">
                  Stylist & Station Allocation
                </span>
                <div className="font-bold text-slate-900">{booking.stylist || 'Rashmi Sah (Master Artist)'}</div>
                <div className="text-[11px] text-emerald-800 font-semibold mt-0.5 flex items-center sm:justify-end gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Station #4 • Class-B Autoclaved Sterile</span>
                </div>
                {booking.promoCode && (
                  <div className="text-[11px] text-champagne-700 font-mono mt-0.5">
                    Festive Privilege: <strong>{booking.promoCode}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-champagne-200 rounded-xl overflow-hidden my-5">
              <table className="w-full text-left text-xs">
                <thead className="bg-espresso-950 text-champagne-200 uppercase font-semibold text-[10px] tracking-wider border-b border-champagne-300">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Treatment / Ritual Description</th>
                    <th className="py-2.5 px-3 text-center">Duration</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-champagne-100 bg-white">
                  {lineItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-champagne-50/50 transition">
                      <td className="py-3 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-espresso-950">{item.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-medium text-champagne-700">{item.category}</span>
                          <span>•</span>
                          <span className="text-emerald-700 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            {item.hygieneNote}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">{item.duration}m</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {item.price > 0 ? `₹${item.price.toLocaleString('en-IN')}` : 'Included'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start my-5 pt-2">
              
              {/* Left Column: QR Code Standee & Payment Details */}
              <div className="sm:col-span-7 space-y-3">
                {cfg.showQrCode && (
                  <div className="p-3.5 rounded-xl bg-champagne-50 border border-champagne-200 flex items-center gap-4">
                    <img 
                      src="/images/serene-upi-qr.jpg" 
                      alt="Paytm UPI Standee QR" 
                      className="w-16 h-16 object-cover rounded-lg border border-champagne-300 shadow-xs shrink-0" 
                    />
                    <div className="text-[11px] text-slate-700 space-y-0.5">
                      <span className="font-bold block text-espresso-950 text-xs">Instant Paytm / GPay / PhonePe</span>
                      <p className="font-mono text-slate-600">VPA: <strong>{cfg.qrUpiId}</strong></p>
                      <p className="text-slate-500">Payee: {cfg.qrPayeeName}</p>
                      <p className="text-[10px] text-emerald-700 font-semibold">
                        Scan to settle outstanding balance or tip your stylist
                      </p>
                    </div>
                  </div>
                )}

                {/* Sterilization Guarantee Seal */}
                {cfg.showSterilizationBadge && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-semibold leading-tight">
                      {cfg.sterilizationBadgeText}
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Financial Totals Breakdown */}
              <div className="sm:col-span-5 space-y-2 bg-champagne-50/60 p-4 rounded-xl border border-champagne-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {Number(booking.discount) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Privilege:</span>
                    <span className="font-mono">-₹{Number(booking.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                {cfg.enableGst && cfg.taxPercent > 0 && (
                  <>
                    <div className="flex justify-between text-slate-500 text-[11px] border-t border-champagne-200/80 pt-1.5">
                      <span>CGST ({cfg.taxPercent / 2}%):</span>
                      <span className="font-mono">₹{cgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>SGST ({cfg.taxPercent / 2}%):</span>
                      <span className="font-mono">₹{sgst.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 text-right">
                      (GST {isTaxInclusive ? 'Inclusive' : 'Exclusive'} in total bill)
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center text-sm font-bold text-espresso-950 border-t-2 border-champagne-300 pt-2">
                  <span>Grand Total:</span>
                  <span className="text-lg font-mono text-emerald-800">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Live Payment Status Pill */}
                <div className={`p-2 rounded-lg text-center font-bold text-[11px] flex items-center justify-between mt-2 ${
                  booking.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                  booking.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  <span>Status: {booking.paymentStatus || 'Confirmed'}</span>
                  {booking.utrNumber && <span className="font-mono text-[10px]">UTR: {booking.utrNumber}</span>}
                </div>
              </div>
            </div>

            {/* Authorized Signatory & Thank You Note */}
            <div className="border-t border-champagne-300 pt-4 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 items-end text-xs">
              <div>
                <p className="font-medium text-slate-700 italic text-[11px]">
                  "{cfg.thankYouNote}"
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {cfg.customFooterNote}
                </p>
              </div>

              {cfg.showSignatory && (
                <div className="sm:text-right space-y-1">
                  <div className="font-serif italic text-base text-champagne-800 font-bold">
                    {cfg.signatoryName}
                  </div>
                  <div className="h-0.5 w-32 bg-champagne-400 ml-auto my-1"></div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                    Authorized Signatory
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {cfg.signatoryTitle}
                  </span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            {Array.isArray(cfg.terms) && cfg.terms.length > 0 && (
              <div className="border-t border-champagne-200/80 pt-3 mt-4 text-[10px] text-slate-500 space-y-1">
                <span className="font-bold uppercase tracking-wider text-slate-600 block">
                  Terms & Sanctuary Policies:
                </span>
                <ol className="list-decimal pl-4 space-y-0.5">
                  {cfg.terms.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Admin Quick Action Footer (No-Print) */}
        {isAdmin && (
          <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Quick Payment Status:</span>
              <select
                value={paymentInput.status}
                onChange={(e) => setPaymentInput({ ...paymentInput, status: e.target.value })}
                className="rounded-lg border border-slate-300 py-1 px-2 text-xs font-semibold focus:ring-1 focus:ring-champagne-500"
              >
                <option value="Paid">🟢 Paid / Settled</option>
                <option value="Pending">🟡 Pending Balance</option>
                <option value="Partial">🟠 Partial Advance</option>
              </select>

              <select
                value={paymentInput.method}
                onChange={(e) => setPaymentInput({ ...paymentInput, method: e.target.value })}
                className="rounded-lg border border-slate-300 py-1 px-2 text-xs focus:ring-1 focus:ring-champagne-500"
              >
                <option value="Paytm UPI">Paytm UPI</option>
                <option value="Cash">Cash at Counter</option>
                <option value="Credit/Debit Card">Credit/Debit Card</option>
              </select>

              <input 
                type="text"
                placeholder="UTR / Txn Ref..."
                value={paymentInput.utrNumber}
                onChange={(e) => setPaymentInput({ ...paymentInput, utrNumber: e.target.value })}
                className="rounded-lg border border-slate-300 py-1 px-2 text-xs font-mono w-32 focus:ring-1 focus:ring-champagne-500"
              />

              <button
                type="button"
                onClick={handleSavePaymentStatus}
                className="px-3 py-1 rounded-lg bg-espresso-900 hover:bg-espresso-950 text-champagne-200 font-bold transition shadow-xs"
              >
                Update Status
              </button>
            </div>

            <div className="text-[11px] text-slate-500">
              Booking Ref: <strong className="font-mono text-slate-800">#{booking.id}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
