import React, { useState } from 'react';
import { Phone, ArrowLeft, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Star } from 'lucide-react';
import CaptchaWidget from '../components/CaptchaWidget';

export default function LoginPage({ onNavigate, onAuthSuccess, showToast }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!captchaToken) {
      showToast('Please verify the security reCAPTCHA checkbox below.');
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
        showToast(data.message || 'OTP sent successfully!');
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter the 4-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await res.json();
      if (data.success) {
        if (data.isNewUser) {
          showToast('Account not found with this number. Redirecting to Sign Up page...');
          onNavigate('signup', { prefillPhone: phone });
        } else {
          localStorage.setItem('serene_user', JSON.stringify(data.user));
          localStorage.setItem('serene_token', data.token);
          onAuthSuccess(data.user);
          showToast(`Welcome back, ${data.user.name}!`);
          onNavigate('home');
        }
      } else {
        showToast(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error verifying OTP.');
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
      
      {/* Top Simple Header */}
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
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-espresso-950 text-champagne-300 font-serif font-bold text-sm flex items-center justify-center">
              S
            </div>
            <span className="font-editorial text-xl font-bold text-espresso-950">
              Serene Salon & Academy
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('signup')}
            className="text-xs font-bold text-champagne-800 hover:text-champagne-950 underline underline-offset-4"
          >
            Create an Account ↗
          </button>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl border border-champagne-300 overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-w-5xl w-full min-h-[580px]">
          
          {/* Left Column: High-Fashion Luxury Editorial Banner */}
          <div className="lg:col-span-5 relative bg-espresso-950 text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
              <img 
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80" 
                alt="Serene Luxury Salon Sanctuary Vadodara" 
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/80 to-transparent"></div>

            {/* Top Brand Pill */}
            <div className="relative z-10">
              <span className="px-3 py-1 rounded-full bg-champagne-500/20 text-champagne-300 text-[10px] font-bold uppercase tracking-wider border border-champagne-400/30">
                Serene Privilege Member
              </span>
            </div>

            {/* Middle Quote & Perks */}
            <div className="relative z-10 py-8 space-y-4">
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-champagne-100 leading-tight">
                Welcome Back to Your Sanctuary
              </h2>
              <p className="text-xs text-champagne-200/90 leading-relaxed font-light">
                Sign in to manage upcoming appointments, review sterile treatment prescriptions, and redeem your earned loyalty points.
              </p>

              <div className="pt-2 space-y-2.5 text-xs text-champagne-200/80">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-champagne-400 shrink-0" />
                  <span>Instant 1-Click WhatsApp slot rescheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Autoclave Class B sterilization pouch guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-current" />
                  <span>Rated 5.0 ★ across 1,551+ verified Justdial reviews</span>
                </div>
              </div>
            </div>

            {/* Bottom Founder Signature */}
            <div className="relative z-10 pt-4 border-t border-champagne-800/60 flex items-center justify-between text-[11px] text-champagne-300/80">
              <span>Led by Rashmi Sah</span>
              <span>FF 16 Raama Emperro, Vadodara</span>
            </div>
          </div>

          {/* Right Column: Sign In Form */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
            <div>
              <div className="space-y-1.5 mb-8">
                <span className="text-[11px] font-bold uppercase tracking-wider text-champagne-700">
                  Passwordless Secure Login
                </span>
                <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-espresso-950">
                  Sign In with Mobile OTP
                </h1>
                <p className="text-xs sm:text-sm text-espresso-800/80">
                  Enter your 10-digit mobile number to receive a one-time passcode.
                </p>
              </div>

              {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-espresso-900 mb-2">
                      Registered Mobile Number *
                    </label>
                    <div className="flex items-center rounded-xl border border-champagne-300 focus-within:border-champagne-600 focus-within:ring-2 focus-within:ring-champagne-200 bg-champagne-50/20 transition shadow-inner overflow-hidden">
                      <div className="flex items-center gap-1.5 px-3.5 py-3.5 bg-champagne-100/70 border-r border-champagne-300 text-espresso-900 select-none shrink-0">
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
                        className="w-full px-4 py-3.5 outline-none text-sm font-medium text-espresso-950 bg-transparent placeholder-espresso-800/40"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Google reCAPTCHA Verification */}
                  <CaptchaWidget 
                    onVerify={(tok) => setCaptchaToken(tok)} 
                    isVerified={Boolean(captchaToken)} 
                  />

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-espresso-950 via-espresso-900 to-black hover:from-black hover:to-espresso-950 text-champagne-100 font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    <span>{loading ? 'Sending Secure OTP...' : 'Request One-Time Password (OTP)'}</span>
                    <ArrowRight className="w-4 h-4 text-champagne-300" />
                  </button>

                  {/* Quick Test Demo Hint */}
                  <div className="p-3 rounded-xl bg-champagne-100/60 border border-champagne-200 text-[11px] text-espresso-800/80 flex items-center justify-between">
                    <span>Quick demo with existing account:</span>
                    <button
                      type="button"
                      onClick={() => setPhone('9876543210')}
                      className="font-mono font-bold text-champagne-800 hover:underline"
                    >
                      9876543210
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
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
                      onClick={() => setStep('phone')}
                      className="hover:underline text-champagne-800 font-semibold"
                    >
                      ← Change Mobile Number
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
                    <span>{loading ? 'Verifying Passcode...' : 'Verify OTP & Sign In'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            {/* Bottom Link to Signup */}
            <div className="pt-8 border-t border-champagne-200 text-center">
              <p className="text-xs text-espresso-800">
                New to Serene Salon & Academy?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="font-bold text-champagne-800 hover:text-champagne-950 underline underline-offset-4 ml-1"
                >
                  Create Your Privilege Account & Claim 150 Points →
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

