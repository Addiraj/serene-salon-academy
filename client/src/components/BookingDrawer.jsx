import React, { useState, useEffect } from 'react';
import { X, Trash2, Tag, Calendar, Clock, User, Phone, CheckCircle2, QrCode, Sparkles } from 'lucide-react';
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

  const upiQrUrl = confirmedBooking 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `upi://pay?pa=6203060789@upi&pn=Serene%20Salon&am=${confirmedBooking.total}&tn=Booking%20${confirmedBooking.id}`
      )}`
    : '';

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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-champagne-300 space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-champagne-200 pb-3">
              <h3 className="font-editorial text-2xl font-bold text-espresso-950">Pay via UPI QR</h3>
              <button onClick={() => setShowUpiModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-espresso-800">Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)</p>
              
              <div className="p-3 bg-white rounded-2xl border-2 border-champagne-300 inline-block shadow-inner">
                <img src={upiQrUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
              </div>

              <div className="p-3 bg-champagne-50 rounded-xl border border-champagne-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payable Amount:</span>
                  <span className="font-bold text-emerald-800 text-sm">₹{confirmedBooking.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Ref:</span>
                  <span className="font-mono font-bold text-espresso-950">#{confirmedBooking.id}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-champagne-200/80">
                  <span className="text-slate-500">UPI ID:</span>
                  <span className="font-mono font-bold text-champagne-800 flex items-center gap-1">
                    <span>6203060789@upi</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('6203060789@upi');
                        showToast('UPI ID copied!');
                      }}
                      className="text-[10px] underline text-espresso-800"
                    >
                      Copy
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button 
                type="button" 
                onClick={() => {
                  setShowUpiModal(false);
                  showToast('Thank you! Payment notification sent to salon.');
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition"
              >
                ✓ I Have Completed Payment
              </button>
              <button 
                type="button" 
                onClick={() => setShowUpiModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Pay at Salon Reception Instead
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
