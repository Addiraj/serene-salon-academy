import React, { useState, useEffect } from 'react';
import { 
  X, Trash2, Tag, Calendar, Clock, User, Phone, CheckCircle2, 
  QrCode, Sparkles, Copy, Check, ExternalLink, ShieldCheck, Smartphone 
} from 'lucide-react';
import CaptchaWidget from './CaptchaWidget';

export default function BookingDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  services, 
  onRemoveFromCart, 
  onBookingSuccess,
  showToast,
  currentUser 
}) {
  const [promoCode, setPromoCode] = useState('');
  const [activePromo, setActivePromo] = useState(null);
  const [promoResult, setPromoResult] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Form Fields
  const [date, setDate] = useState(() => {
    return new Date(Date.now() + 86400000).toISOString().split('T')[0];
  });
  const [time, setTime] = useState('11:30 AM');
  const [stylist, setStylist] = useState('Rashmi Sah (Founder & Master Artist)');
  const [guestName, setGuestName] = useState(currentUser ? currentUser.name : '');
  const [guestPhone, setGuestPhone] = useState(currentUser ? currentUser.phone.replace('+91 ', '') : '');
  const [notes, setNotes] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if currentUser logs in while drawer is open or changes
  useEffect(() => {
    if (currentUser) {
      if (!guestName) setGuestName(currentUser.name || '');
      if (!guestPhone) setGuestPhone((currentUser.phone || '').replace('+91 ', ''));
    }
  }, [currentUser]);

  // UPI QR Modal state
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiTab, setUpiTab] = useState('paytm'); // 'paytm' | 'dynamic'
  const [utrInput, setUtrInput] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  if (!isOpen) return null;

  const cartItems = cart.map(id => services.find(s => s.id === id)).filter(Boolean);
  const subtotal = cartItems.reduce((acc, s) => acc + s.price, 0);
  const totalMins = cartItems.reduce((acc, s) => acc + s.duration, 0);

  const discountAmount = activePromo 
    ? Math.round(subtotal * (activePromo.discountPercent / 100))
    : 0;

  const pointsDiscount = (redeemPoints && currentUser && currentUser.loyaltyPoints) 
    ? Math.min(currentUser.loyaltyPoints, Math.max(0, subtotal - discountAmount))
    : 0;

  const finalTotal = Math.max(0, subtotal - discountAmount - pointsDiscount);

  // Validate Promo Code
  const handleApplyPromo = async () => {
    const clean = promoCode.trim().toUpperCase();
    if (!clean) {
      setPromoResult({ error: 'Please enter a coupon code.' });
      return;
    }

    setValidatingPromo(true);
    setPromoResult(null);

    try {
      const res = await fetch('/api/offers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, subtotal })
      });
      const data = await res.json();
      if (data.success) {
        setActivePromo(data.offer);
        setPromoResult({ message: data.message });
        showToast(`Coupon ${clean} applied!`);
      } else {
        setActivePromo(null);
        setPromoResult({ error: data.message || 'Invalid coupon code.' });
      }
    } catch (err) {
      setPromoResult({ error: 'Error validating promo code.' });
    } finally {
      setValidatingPromo(false);
    }
  };

  // Submit Appointment
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Please select at least one treatment before booking.');
      return;
    }

    if (!guestName.trim() || !guestPhone.trim()) {
      alert('Please enter your full name and 10-digit mobile number.');
      return;
    }

    if (!captchaToken) {
      showToast('Please complete the reCAPTCHA security check below.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          userId: currentUser ? currentUser.id : null,
          date,
          time,
          stylist,
          services: cart,
          promoCode: activePromo ? activePromo.code : '',
          pointsDiscount,
          notes
        })
      });
      const data = await res.json();
      if (data.success) {
        setConfirmedBooking(data.booking);
        onBookingSuccess();
        showToast(`Booking #${data.booking.id} Confirmed!`);
      } else {
        alert(data.message || 'Error booking appointment.');
      }
    } catch (err) {
      alert('Server connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const upiId = '6203060789@ptaxis';
  const payeeName = 'RASHMI KUMARI';
  const upiDeepLink = confirmedBooking 
    ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${confirmedBooking.total}&tn=${encodeURIComponent(`Booking #${confirmedBooking.id}`)}`
    : `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}`;

  const dynamicQrUrl = confirmedBooking 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiDeepLink)}`
    : '';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setIsCopied(true);
    showToast(`UPI ID "${upiId}" copied to clipboard!`);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleConfirmUpiPayment = async () => {
    if (!confirmedBooking) return;
    setIsConfirmingPayment(true);
    try {
      await fetch(`/api/bookings/${confirmedBooking.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'Paytm UPI QR',
          utrNumber: utrInput.trim(),
          amount: confirmedBooking.total
        })
      });
      showToast('Payment confirmed! Salon reception has been notified.');
      setShowUpiModal(false);
    } catch (err) {
      showToast('Payment marked as complete.');
      setShowUpiModal(false);
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-sm flex justify-end">
        <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
          
          {/* Drawer Header */}
          <div className="p-5 border-b border-champagne-200 flex items-center justify-between bg-champagne-50">
            <div>
              <span className="text-[10px] font-bold text-champagne-700 uppercase tracking-wider">Sanctuary Reservation</span>
              <h3 className="font-editorial text-2xl font-bold text-espresso-950">Your Appointment Booking</h3>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-champagne-300 flex items-center justify-center text-espresso-800 hover:bg-champagne-100 font-bold transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            
            {/* Selected Treatments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-espresso-900 uppercase tracking-wider">Selected Treatments</label>
                <span className="text-xs text-espresso-800/70 font-medium">{totalMins} mins</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="p-6 rounded-2xl bg-champagne-50 border border-champagne-200 text-center text-xs text-espresso-800">
                  No treatments selected yet. Browse our Rate Card to select services!
                </div>
              ) : (
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-champagne-50/80 border border-champagne-200 text-xs"
                    >
                      <div>
                        <div className="font-bold text-espresso-950">{item.name}</div>
                        <div className="text-[11px] text-espresso-800/70">
                          ⏱ {item.duration} mins • ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <button 
                        onClick={() => onRemoveFromCart(item.id)}
                        className="text-rose-600 hover:text-rose-800 p-1 font-bold"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Promo Code Input */}
            <div className="p-4 rounded-2xl bg-champagne-50 border border-champagne-200 space-y-2">
              <label className="block text-xs font-bold text-espresso-900 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-champagne-700" />
                <span>Festive Voucher / Promo Code</span>
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="e.g. SERENE20" 
                  className="flex-1 text-xs rounded-xl border border-champagne-300 py-2 px-3 uppercase font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500"
                />
                <button 
                  type="button" 
                  onClick={handleApplyPromo}
                  disabled={validatingPromo}
                  className="px-4 py-2 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 text-xs font-bold transition shadow"
                >
                  {validatingPromo ? '...' : 'Apply'}
                </button>
              </div>

              {promoResult && (
                <div className={`text-xs font-semibold ${promoResult.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {promoResult.error || `✓ ${promoResult.message}`}
                </div>
              )}
            </div>

            {/* Date, Time & Stylist */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider">Schedule & Specialist</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-espresso-800/80 mb-1">Appointment Date</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-champagne-300 py-2 px-2.5 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-espresso-800/80 mb-1">Time Slot</label>
                  <select 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs rounded-xl border border-champagne-300 py-2 px-2.5 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                  >
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                    <option value="07:00 PM">07:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-espresso-800/80 mb-1">Assigned Specialist</label>
                <select 
                  value={stylist}
                  onChange={(e) => setStylist(e.target.value)}
                  className="w-full text-xs rounded-xl border border-champagne-300 py-2 px-3 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                >
                  <option value="Rashmi Sah (Founder & Master Artist)">Rashmi Sah (Founder & Master Artist)</option>
                  <option value="Senior Skin & Laser Aesthetician">Senior Skin Specialist</option>
                  <option value="Senior Hair & Balayage Expert">Senior Hair Expert</option>
                  <option value="Senior Nail & Lash Technician">Nail & Lash Specialist</option>
                </select>
              </div>
            </div>

            {/* Guest Details */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-espresso-900 uppercase tracking-wider">Your Contact Details</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-espresso-800/80 mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Ananya Patel" 
                    className="w-full text-xs rounded-xl border border-champagne-300 py-2 px-3 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-espresso-800/80 mb-1">Mobile / WhatsApp *</label>
                  <input 
                    type="tel" 
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="10-digit number" 
                    className="w-full text-xs rounded-xl border border-champagne-300 py-2 px-3 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500 font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-espresso-800/80 mb-1">Special Preferences / Skin Allergy Notes</label>
                <input 
                  type="text" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sensitive scalp, extra gentle extraction..." 
                  className="w-full text-xs rounded-xl border border-champagne-300 py-2 px-3 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
                />
              </div>
            </div>

            {/* Confirmed Booking Box */}
            {confirmedBooking && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-2.5">
                <div className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Appointment Confirmed! Booking #{confirmedBooking.id}</span>
                </div>
                <div className="text-xs space-y-1 text-emerald-950">
                  <p><strong>Guest:</strong> {confirmedBooking.guestName} ({confirmedBooking.guestPhone})</p>
                  <p><strong>Schedule:</strong> {confirmedBooking.date} at {confirmedBooking.time}</p>
                  <p><strong>Specialist:</strong> {confirmedBooking.stylist}</p>
                  <p><strong>Total Bill:</strong> ₹{confirmedBooking.total.toLocaleString('en-IN')} (Sterile Kit Reserved)</p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <a 
                    href={`https://wa.me/916203060789?text=${encodeURIComponent(
                      `Hello Serene Salon & Academy! My Booking ID is #${confirmedBooking.id}. Name: ${confirmedBooking.guestName} (${confirmedBooking.guestPhone}). Services: ${(confirmedBooking.services || []).join(', ')}. Date: ${confirmedBooking.date} at ${confirmedBooking.time} with ${confirmedBooking.stylist}. Total: ₹${confirmedBooking.total.toLocaleString('en-IN')}.`
                    )}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow"
                  >
                    Send Slot to WhatsApp (+91 6203060789) ↗
                  </a>

                  <button 
                    type="button" 
                    onClick={() => setShowUpiModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-espresso-900 text-champagne-200 text-xs font-bold hover:bg-espresso-950 transition flex items-center gap-1.5 shadow"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pay via UPI QR (GPay/PhonePe)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer Totals & Confirm */}
          <div className="p-5 border-t border-champagne-200 bg-champagne-50/80 space-y-3">
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-espresso-800/70">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {activePromo && discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-800 font-semibold">
                  <span>Promotional Discount ({activePromo.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Loyalty Points Redemption */}
              {currentUser && currentUser.loyaltyPoints > 0 && (
                <div className="p-2.5 rounded-xl bg-champagne-100 border border-champagne-300 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={redeemPoints}
                      onChange={(e) => setRedeemPoints(e.target.checked)}
                      className="w-4 h-4 text-champagne-700 rounded border-champagne-400 focus:ring-champagne-500"
                    />
                    <span className="text-xs text-espresso-950 font-medium">
                      Redeem <strong>{currentUser.loyaltyPoints} Privilege Pts</strong> (Save ₹{currentUser.loyaltyPoints})
                    </span>
                  </label>
                  <Sparkles className="w-4 h-4 text-champagne-700" />
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-800 font-semibold">
                  <span>Loyalty Privilege Discount</span>
                  <span>-₹{pointsDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-base font-bold text-espresso-950 pt-1 border-t border-champagne-200">
                <span>Total Payable at Salon</span>
                <span className="text-xl font-editorial text-espresso-950">
                  ₹{finalTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* reCAPTCHA Bot Protection */}
            {!confirmedBooking && (
              <div className="pt-1">
                <CaptchaWidget 
                  onVerify={(tok) => setCaptchaToken(tok)}
                  isVerified={Boolean(captchaToken)}
                />
              </div>
            )}

            <button 
              type="button" 
              onClick={handleConfirmBooking}
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full py-3.5 bg-espresso-900 hover:bg-espresso-950 text-champagne-200 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Confirming Slot...' : 'Confirm Sterile Slot & Generate WhatsApp Link'}</span>
              <span>→</span>
            </button>

            <div className="text-[11px] text-center text-espresso-800/70">
              ✓ 100% Sterile Kit Reserved • Pay After Treatment at Salon Reception
            </div>
          </div>
        </div>
      </div>

      {/* UPI QR Payment Modal */}
      {showUpiModal && confirmedBooking && (
        <div className="fixed inset-0 z-50 bg-espresso-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-champagne-300 space-y-4 max-h-[95vh] overflow-y-auto">
            
            {/* Header: Verified Merchant Info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-full bg-[#002e6e] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  RK
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-sm">RASHMI KUMARI</span>
                    <span className="w-4 h-4 bg-blue-600 rounded-full text-white text-[10px] flex items-center justify-center font-bold" title="Verified Merchant">
                      ✓
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Paytm UPI • Serene Salon & Academy</div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowUpiModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payable Amount & Reference Banner */}
            <div className="bg-gradient-to-r from-champagne-50 to-champagne-100/70 p-3.5 rounded-2xl border border-champagne-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Bill Payable</span>
                <div className="font-editorial text-2xl font-bold text-espresso-950">
                  ₹{confirmedBooking.total.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Booking Ref</span>
                <div className="font-mono font-bold text-espresso-900 text-xs bg-white px-2 py-0.5 rounded-md border border-champagne-300 mt-0.5">
                  #{confirmedBooking.id}
                </div>
              </div>
            </div>

            {/* QR View Mode Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUpiTab('paytm')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  upiTab === 'paytm' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Paytm Official QR
              </button>
              <button
                type="button"
                onClick={() => setUpiTab('dynamic')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  upiTab === 'dynamic' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Auto-Amount QR (₹{confirmedBooking.total})
              </button>
            </div>

            {/* QR Scanner Display Area */}
            <div className="text-center space-y-2">
              {upiTab === 'paytm' ? (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <img 
                    src="/images/serene-upi-qr.jpg" 
                    alt="Paytm UPI QR Code - Rashmi Kumari" 
                    className="max-h-64 sm:max-h-72 mx-auto rounded-xl shadow-xs object-contain"
                  />
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">
                    Official Paytm QR standee of salon founder Rashmi Kumari
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="p-3 bg-white rounded-2xl border-2 border-champagne-300 inline-block shadow-inner">
                    <img 
                      src={dynamicQrUrl} 
                      alt={`Dynamic UPI QR for ₹${confirmedBooking.total}`} 
                      className="w-48 h-48 mx-auto" 
                    />
                  </div>
                  <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 py-1 px-2.5 rounded-lg border border-emerald-200 inline-block">
                    ✓ Scanning auto-fills ₹{confirmedBooking.total.toLocaleString('en-IN')} & Ref #{confirmedBooking.id}
                  </div>
                </div>
              )}
            </div>

            {/* Direct Tap to Pay on Mobile */}
            <div>
              <a
                href={upiDeepLink}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>Tap to Open UPI App (GPay / PhonePe / Paytm)</span>
              </a>
            </div>

            {/* Copyable UPI ID Box */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Payee VPA / UPI ID</span>
                <span className="font-mono font-bold text-slate-900 text-xs">6203060789@ptaxis</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1 shadow-xs transition"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Supported Payment Apps Icons */}
            <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-400">Works with:</span>
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-bold text-[10px]">Paytm</span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px]">PhonePe</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">GPay</span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px]">BHIM</span>
            </div>

            {/* Transaction Confirmation / UTR Input */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  UPI Transaction Ref / UTR Number (Optional)
                </label>
                <input 
                  type="text"
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. 4312XXXXXXXX (from your payment receipt)"
                  className="w-full text-xs rounded-xl border border-slate-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500 font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  type="button" 
                  disabled={isConfirmingPayment}
                  onClick={handleConfirmUpiPayment}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isConfirmingPayment ? 'Recording Payment...' : '✓ I Have Completed Payment'}</span>
                </button>

                <a 
                  href={`https://wa.me/916203060789?text=${encodeURIComponent(
                    `Hello Rashmi Kumari (Serene Salon & Academy)! I have completed UPI payment of ₹${confirmedBooking.total} for Booking #${confirmedBooking.id} (Name: ${confirmedBooking.guestName}, Phone: ${confirmedBooking.guestPhone}).${utrInput ? ` UTR/Ref: ${utrInput}` : ''}`
                  )}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>Share Payment Proof on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button 
                  type="button" 
                  onClick={() => setShowUpiModal(false)}
                  className="w-full py-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Pay at Salon Reception Instead
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
