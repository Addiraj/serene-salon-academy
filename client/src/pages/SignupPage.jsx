import React, { useState } from 'react';
import { User, Phone, Mail, ArrowLeft, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Gift, Check } from 'lucide-react';
import CaptchaWidget from '../components/CaptchaWidget';

const BEAUTY_INTERESTS = [
  'Skin & Medifacials',
  'Hair Care & Balayage',
  'Acrylic Nail Artistry',
  'Royal Bridal & Festive',
  'Beauty Academy Cosmetology'
];

export default function SignupPage({ onNavigate, onAuthSuccess, showToast, initialPhone = '', settings }) {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState(['Skin & Medifacials', 'Hair Care & Balayage']);
  const [otp, setOtp] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);

  React.useEffect(() => {
    let interval;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const toggleInterest = (interest) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name.');
      return;
    }
    if (!phone || phone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!captchaToken) {
      showToast('Please complete the reCAPTCHA security verification below.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, captchaToken })
      });

      const data = await res.json();
      if (data.success) {
        setDevOtp(data.devOtp);
        setStep('otp');
        setResendTimer(30);
        showToast('OTP sent to your mobile!');
      } else {
        showToast(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter the 4-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP first
      const vRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const vData = await vRes.json();

      if (!vData.success) {
        showToast(vData.message || 'Invalid verification OTP.');
        setLoading(false);
        return;
      }

      // 2. Register new profile
      const rRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: name.trim(),
          email: email.trim(),
          interests
        })
      });

      const rData = await rRes.json();
      if (rData.success) {
        localStorage.setItem('serene_user', JSON.stringify(rData.user));
        localStorage.setItem('serene_token', rData.token);
        onAuthSuccess(rData.user);
        showToast(`Welcome to Serene Privilege Club, ${rData.user.name}! 150 points credited.`);
        onNavigate('home');
      } else {
        showToast(rData.message || 'Error registering profile.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error registering your account.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, captchaToken: 'resend-tok' })
      });
      const data = await res.json();
      if (data.success) {
        setDevOtp(data.devOtp);
        setResendTimer(30);
        showToast('New OTP sent to your phone!');
      }
    } catch (err) {
      showToast('Error resending OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-champagne-50 flex flex-col justify-between">
      
      {/* Top Header */}
      <header className="border-b border-champagne-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <button 
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-xs font-semibold text-espresso-800 hover:text-champagne-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Salon Home</span>
          </button>

          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {settings?.logoUrl ? (
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-champagne-400 via-champagne-200 to-amber-500 shadow-xs flex items-center justify-center overflow-hidden shrink-0 bg-white">
                <img 
                  src={settings.logoUrl} 
                  alt="Serene Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fb = e.currentTarget.nextElementSibling;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full rounded-full bg-espresso-950 items-center justify-center text-champagne-300 font-serif font-bold text-sm">
                  S
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-espresso-950 text-champagne-300 font-serif font-bold text-sm flex items-center justify-center">
                S
              </div>
            )}
            <span className="font-editorial text-xl font-bold text-espresso-950">
              {settings?.salonName || 'Serene Salon & Academy'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-xs font-bold text-champagne-800 hover:text-champagne-950 underline underline-offset-4"
          >
            Sign In here ↗
          </button>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl border border-champagne-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-w-5xl w-full min-h-[640px]">
          
          {/* Left Column: High-Fashion Luxury Editorial Banner */}
          <div className="lg:col-span-5 relative bg-espresso-950 text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
              <img 
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80" 
                alt="Serene Luxury Salon Academy Vadodara" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/80 to-transparent"></div>

            {/* Top Badge */}
            <div className="relative z-10 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-champagne-500/20 text-champagne-300 text-[10px] font-bold uppercase tracking-wider border border-champagne-400/30 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-champagne-400" />
                <span>150 Welcome Points Bonus</span>
              </span>
            </div>

            {/* Middle Copy */}
            <div className="relative z-10 py-6 space-y-4">
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-champagne-100 leading-tight">
                Join the Serene Privilege Club
              </h2>
              <p className="text-xs text-champagne-200/90 leading-relaxed font-light">
                Become a valued member of Vadodara’s premier clinical-hygiene salon and beauty training academy led by <strong>Rashmi Sah</strong>.
              </p>

              {/* Membership Benefits List */}
              <div className="pt-2 space-y-3 text-xs text-champagne-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-champagne-500/20 flex items-center justify-center text-champagne-300 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>150 Welcome Points:</strong> Instantly redeemable for ₹150 off your first treatment.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-champagne-500/20 flex items-center justify-center text-champagne-300 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Priority Booking Suites:</strong> Skip wait times with reserved sterilization slots.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-champagne-500/20 flex items-center justify-center text-champagne-300 shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Exclusive Member Rates:</strong> Early access to Navratri, Diwali & Bridal promotions.</span>
                </div>
              </div>
            </div>

            {/* Bottom Founder Line */}
            <div className="relative z-10 pt-4 border-t border-champagne-800/60 flex items-center justify-between text-[11px] text-champagne-300/80">
              <span>Class B Autoclave Benchmark</span>
              <span>100% Sterile Kits</span>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
            <div>
              <div className="space-y-1.5 mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-champagne-700">
                  New Guest Registration
                </span>
                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-espresso-950">
                  Create Your Account
                </h1>
                <p className="text-xs sm:text-sm text-espresso-800/80">
                  Fill in your details below to activate your privilege membership.
                </p>
              </div>

              {step === 'form' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-espresso-900 mb-1.5">
                      Full Legal or Preferred Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-champagne-600" />
                      <input 
                        type="text"
                        required
                        placeholder="e.g. Ananya Patel"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-champagne-300 focus:border-champagne-600 focus:ring-2 focus:ring-champagne-200 outline-none text-sm text-espresso-950 bg-champagne-50/20 transition shadow-inner"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-bold text-espresso-900 mb-1.5">
                      Mobile Number (For WhatsApp Slots & OTP) *
                    </label>
                    <div className="flex items-center rounded-xl border border-champagne-300 focus-within:border-champagne-600 focus-within:ring-2 focus-within:ring-champagne-200 bg-champagne-50/20 transition shadow-inner overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3.5 py-3 bg-champagne-100/70 border-r border-champagne-300 text-espresso-900 select-none shrink-0">
                        <Phone className="w-4 h-4 text-champagne-700" />
                        <span className="text-xs font-bold font-mono tracking-wide">+91</span>
                      </div>
                      <input 
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 outline-none text-sm font-medium text-espresso-950 bg-transparent placeholder-espresso-800/40"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-espresso-900 mb-1.5">
                      Email Address (Optional, for invoices)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-champagne-600" />
                      <input 
                        type="email"
                        placeholder="e.g. ananya.patel@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-champagne-300 focus:border-champagne-600 focus:ring-2 focus:ring-champagne-200 outline-none text-sm text-espresso-950 bg-champagne-50/20 transition shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Beauty Interests Selection */}
                  <div>
                    <label className="block text-xs font-bold text-espresso-900 mb-2">
                      Beauty Interests & Preferences
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BEAUTY_INTERESTS.map(item => {
                        const isSelected = interests.includes(item);
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleInterest(item)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                              isSelected
                                ? 'bg-champagne-500 text-espresso-950 font-bold border border-champagne-600 shadow-xs'
                                : 'bg-champagne-100/70 text-espresso-800 hover:bg-champagne-200 border border-champagne-200'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Google reCAPTCHA Verification */}
                  <CaptchaWidget 
                    onVerify={(tok) => setCaptchaToken(tok)} 
                    isVerified={Boolean(captchaToken)} 
                  />

                  <button
                    type="submit"
                    disabled={loading || !name.trim() || phone.length < 10}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 mt-2"
                  >
                    <span>{loading ? 'Sending Registration OTP...' : 'Send Registration OTP & Claim 150 Points'}</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteRegistration} className="space-y-5">
                  {devOtp && (
                    <div className="p-4 bg-champagne-100 border border-champagne-400 rounded-2xl text-xs text-espresso-950 flex items-center justify-between animate-fade-in shadow-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-champagne-700 shrink-0" />
                        <span>Simulated SMS Code: <strong className="font-mono text-base tracking-widest text-espresso-950">{devOtp}</strong></span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtp(devOtp)}
                        className="px-3 py-1 rounded-lg bg-champagne-500 text-espresso-950 text-[11px] font-bold shadow hover:bg-champagne-600 transition"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div className="text-center space-y-2">
                    <label className="block text-xs font-semibold text-espresso-900">
                      Enter 4-Digit Passcode Sent to +91 {phone}
                    </label>
                    <div className="flex justify-center">
                      <input 
                        type="text"
                        required
                        maxLength={4}
                        placeholder="• • • •"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-56 text-center py-3.5 text-3xl tracking-[0.6em] font-mono font-bold rounded-2xl border-2 border-champagne-400 focus:border-champagne-700 focus:ring-4 focus:ring-champagne-200 outline-none bg-champagne-50/30 text-espresso-950 shadow-inner"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-espresso-800/80 pt-1">
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="hover:underline text-champagne-800 font-semibold"
                    >
                      ← Edit Details
                    </button>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleResend}
                      className={`font-semibold ${resendTimer > 0 ? 'text-espresso-800/40 cursor-not-allowed' : 'text-champagne-800 hover:underline'}`}
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 4}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Activating Membership...' : 'Verify OTP & Activate Membership (+150 Pts)'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Link to Sign In */}
            <div className="pt-6 border-t border-champagne-200 text-center">
              <p className="text-xs text-espresso-800">
                Already have a Serene account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="font-bold text-champagne-800 hover:text-champagne-950 underline underline-offset-4 ml-1"
                >
                  Sign In with Mobile OTP →
                </button>
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 border-t border-champagne-200/80 text-center text-xs text-espresso-800/60">
        © 2026 Serene Salon & Academy Vadodara • Hospital-Grade Autoclave Sterilization • Phone: +91 6203060789
      </footer>

    </div>
  );
}

