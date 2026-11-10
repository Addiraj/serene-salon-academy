import React, { useState } from 'react';
import { User, Phone, CheckCircle2, ShieldCheck, Sparkles, ArrowRight, Star } from 'lucide-react';
import CaptchaWidget from './CaptchaWidget';

export default function EnrichHeroBooking({ onScrollToServices, showToast, onQuickSuccess }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [segment, setSegment] = useState('women'); // 'women' | 'academy'
  const [captchaToken, setCaptchaToken] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Please enter your name and mobile number.');
      return;
    }

    if (!captchaToken) {
      showToast('Please complete the reCAPTCHA security verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings/quick-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          segment,
          captchaToken
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedData(data);
        showToast(data.message || 'Booking request confirmed!');
        if (onQuickSuccess) onQuickSuccess(data);
      } else {
        showToast(data.message || 'Could not submit request. Please try again.');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error. Please try again or WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="quickBookingSection" className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 mb-16">
      <div className="bg-white rounded-3xl shadow-2xl border border-champagne-300/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all">
        
        {/* LEFT COLUMN: Enrich-Style High-Fashion Promotional Banner */}
        <div className="lg:col-span-5 relative bg-espresso-950 text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden min-h-[380px]">
          {/* Background Photography with Luxury Dark Vignette */}
          <div className="absolute inset-0 opacity-45 mix-blend-luminosity">
            <img 
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80" 
              alt="Serene Luxury Salon & Beauty Academy" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/70 to-transparent"></div>

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-champagne-300">
                Vadodara Sanctuary
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-champagne-500/20 text-champagne-300 text-[10px] font-bold border border-champagne-400/30">
              Enrich-Standard Luxury
            </span>
          </div>

          {/* Central Editorial Hook */}
          <div className="relative z-10 my-auto py-6 space-y-3">
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-4xl font-bold text-champagne-100 uppercase tracking-tight leading-tight">
              YOUR FIRST VISIT, <br />
              <span className="text-champagne-400">YOUR WAY!</span>
            </h2>
            <p className="text-xs text-champagne-200/90 tracking-wide font-light max-w-sm">
              FROM CLINICAL MEDIFACIALS & HAIR SPA TO COMPLETE BRIDAL & FESTIVE MAKEOVERS.
            </p>

            {/* Split Price Privileges */}
            <div className="pt-3 flex items-center gap-6 border-t border-champagne-800/60">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-champagne-400">
                  WOMEN'S PRIVILEGES
                </div>
                <div className="font-editorial text-2xl font-bold text-white">
                  FROM <span className="text-champagne-300">₹549</span>
                </div>
              </div>
              <div className="h-8 w-px bg-champagne-800"></div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-champagne-400">
                  ACADEMY DIPLOMAS
                </div>
                <div className="font-editorial text-2xl font-bold text-white">
                  FROM <span className="text-champagne-300">₹4,999</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Explore Button */}
          <div className="relative z-10 pt-2">
            <button
              type="button"
              onClick={onScrollToServices}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>BOOK NOW TO EXPLORE</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <div className="text-[10px] text-champagne-400/70 mt-2 font-mono">
              *T&C Apply • Medical-Grade Autoclave Sterilized
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Enrich-Style 2-Step Appointment Request Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="space-y-1 mb-6">
              <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-espresso-950">
                Book an appointment at Serene
              </h3>
              <p className="text-xs sm:text-sm text-espresso-800/80">
                Tell us how to reach you and we'll take it from there.
              </p>
            </div>

            {submittedData ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-editorial text-2xl font-bold text-espresso-950">
                  {submittedData.message || 'Request Received!'}
                </h4>
                <p className="text-xs text-espresso-800/80 max-w-sm mx-auto">
                  Our master concierge and founder <strong>Rashmi Sah</strong> are reviewing your sterile appointment slot.
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/916203060789?text=Hello%20Serene%20Salon!%20I%20just%20submitted%20a%20priority%20booking%20request%20for%20${encodeURIComponent(name)}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
                  >
                    Open Direct WhatsApp Confirmation ↗
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedData(null);
                    setName('');
                    setPhone('');
                    setCaptchaToken(null);
                  }}
                  className="text-xs text-champagne-800 underline block mx-auto mt-2"
                >
                  Book another appointment
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Input 1: Your name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-champagne-600" />
                  <input 
                    type="text"
                    required
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-champagne-300 focus:border-champagne-600 focus:ring-2 focus:ring-champagne-200 outline-none text-sm text-espresso-950 placeholder-espresso-800/50 bg-champagne-50/30 transition"
                  />
                </div>

                {/* Input 2: +91 Mobile number */}
                <div className="flex items-center rounded-xl border border-champagne-300 focus-within:border-champagne-600 focus-within:ring-2 focus-within:ring-champagne-200 bg-champagne-50/30 transition overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3.5 py-3.5 bg-champagne-100/70 border-r border-champagne-300 text-espresso-900 select-none shrink-0">
                    <Phone className="w-4 h-4 text-champagne-700" />
                    <span className="text-xs font-bold font-mono tracking-wide">+91</span>
                  </div>
                  <input 
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3.5 outline-none text-sm text-espresso-950 placeholder-espresso-800/40 bg-transparent font-medium"
                  />
                </div>

                {/* Segmented Toggle: Women vs Academy */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-champagne-100/70 rounded-xl border border-champagne-200/80">
                  <button
                    type="button"
                    onClick={() => setSegment('women')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                      segment === 'women'
                        ? 'bg-white text-espresso-950 shadow-sm border border-champagne-300/60'
                        : 'text-espresso-800/70 hover:text-espresso-950'
                    }`}
                  >
                    Women's Luxury Salon
                  </button>
                  <button
                    type="button"
                    onClick={() => setSegment('academy')}
                    className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                      segment === 'academy'
                        ? 'bg-white text-espresso-950 shadow-sm border border-champagne-300/60'
                        : 'text-espresso-800/70 hover:text-espresso-950'
                    }`}
                  >
                    Beauty Academy Training
                  </button>
                </div>

                {/* Google reCAPTCHA Verification Widget */}
                <CaptchaWidget 
                  onVerify={(token) => setCaptchaToken(token)}
                  isVerified={Boolean(captchaToken)}
                />

                {/* CTA Button: Enrich Red / Crimson Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isSubmitting ? 'Securing Priority Slot...' : 'Request a booking'}
                </button>

                {/* Legal / Privacy text */}
                <p className="text-[11px] text-espresso-800/60 text-center leading-normal">
                  By continuing you agree to our <a href="#terms" className="underline hover:text-espresso-950">Terms</a> and <a href="#privacy" className="underline hover:text-espresso-950">Privacy policy</a>, and to us calling or messaging you via WhatsApp about this sterile booking.
                </p>
              </form>
            )}
          </div>

          {/* Social Proof Footnote (Identical to Enrich footer in screenshot) */}
          <div className="pt-6 mt-6 border-t border-champagne-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-espresso-800">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-espresso-950 flex items-center justify-center text-[10px]">
                <Star className="w-3 h-3 fill-current" />
              </span>
              <span>5.0</span>
              <span className="text-espresso-800/60 font-normal">(1,551+ reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-espresso-800/70">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Autoclave Sterilized</span>
            </div>
            <div className="font-semibold text-espresso-900">
              12,000+ happy guests
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

