import React, { useState, useEffect } from 'react';
import { X, Phone, Lock, User, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';
import CaptchaWidget from './CaptchaWidget';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, showToast }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'register'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let interval;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      showToast('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!captchaToken) {
      showToast('Please complete the security reCAPTCHA verification.');
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
        showToast(data.message || 'Error sending OTP');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to connect to authentication server');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      showToast('Please enter the 4-digit OTP code.');
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
          setStep('register');
          showToast(data.message || 'Mobile verified! Please set your name.');
        } else {
          // Logged in successfully
          localStorage.setItem('serene_user', JSON.stringify(data.user));
          localStorage.setItem('serene_token', data.token);
          onAuthSuccess(data.user, data.token);
          showToast(data.message || `Welcome back, ${data.user.name}!`);
          onClose();
        }
      } else {
        showToast(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete New User Profile Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: name.trim(),
          email: email.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('serene_user', JSON.stringify(data.user));
        localStorage.setItem('serene_token', data.token);
        onAuthSuccess(data.user, data.token);
        showToast(data.message || 'Registration complete! Welcome to Serene Privilege Club.');
        onClose();
      } else {
        showToast(data.message || 'Failed to complete registration');
      }
    } catch (err) {
      console.error(err);
      showToast('Error registering profile');
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
    <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-champagne-300 overflow-hidden relative animate-scale-up">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-espresso-950 via-espresso-900 to-espresso-950 p-6 text-white relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-champagne-200 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-champagne-400"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-champagne-300">
              Serene Privilege Club
            </span>
          </div>

          <h3 className="font-editorial text-2xl font-bold text-champagne-100">
            {step === 'phone' && 'Login or Sign Up'}
            {step === 'otp' && 'Verify Mobile OTP'}
            {step === 'register' && 'Complete Your Profile'}
          </h3>
          <p className="text-xs text-champagne-200/80 mt-1">
            {step === 'phone' && 'Access your appointments, loyalty points & member privileges.'}
            {step === 'otp' && `Enter the 4-digit code sent to +91 ${phone}`}
            {step === 'register' && 'Unlock 150 Welcome Loyalty Points & faster checkouts.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          
          {/* STEP 1: Phone & Captcha */}
          {step === 'phone' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso-900 mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-xl border border-champagne-300 focus-within:border-champagne-600 focus-within:ring-2 focus-within:ring-champagne-200 bg-champagne-50/20 transition overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-3 bg-champagne-100/70 border-r border-champagne-300 text-espresso-900 select-none shrink-0">
                    <Phone className="w-4 h-4 text-champagne-700" />
                    <span className="text-xs font-bold font-mono tracking-wide">+91</span>
                  </div>
                  <input 
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-3 outline-none text-sm font-medium text-espresso-950 bg-transparent placeholder-espresso-800/40"
                    autoFocus
                  />
                </div>
              </div>

              {/* Bot Security */}
              <div className="pt-1">
                <CaptchaWidget 
                  onVerify={(tok) => setCaptchaToken(tok)} 
                  isVerified={Boolean(captchaToken)} 
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                <span>{loading ? 'Sending OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[11px] text-espresso-800/70">
                🔒 OTP will be sent via SMS/WhatsApp. Quick test with sample number: <code className="font-mono bg-champagne-100 px-1.5 py-0.5 rounded text-espresso-950">9876543210</code>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* Simulated on-screen test banner for instant local testing */}
              {devOtp && (
                <div className="p-3 bg-champagne-100 border border-champagne-400 rounded-xl text-xs text-espresso-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-champagne-700 shrink-0" />
                    <span>Demo OTP Code: <strong className="font-mono text-sm tracking-widest text-espresso-950">{devOtp}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="px-2 py-1 rounded bg-champagne-500 text-espresso-950 text-[10px] font-bold shadow hover:bg-champagne-600 transition"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-espresso-900 mb-1.5 text-center">
                  Enter 4-Digit OTP
                </label>
                <div className="flex justify-center">
                  <input 
                    type="text"
                    required
                    maxLength={4}
                    placeholder="• • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-48 text-center py-3 text-2xl tracking-[0.5em] font-mono font-bold rounded-xl border border-champagne-400 focus:border-champagne-700 focus:ring-2 focus:ring-champagne-200 outline-none bg-champagne-50/30 text-espresso-950 shadow-inner"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-espresso-800/80 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="hover:underline text-champagne-800 font-medium"
                >
                  Change Mobile
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
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 3: Complete New User Profile Registration */}
          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 rounded-xl bg-champagne-100 border border-champagne-300 text-xs text-espresso-900 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-champagne-700 shrink-0" />
                <span>You're one step away from unlocking <strong>150 Privilege Points</strong>!</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-900 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-champagne-700" />
                  <input 
                    type="text"
                    required
                    placeholder="Your legal or preferred name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-champagne-300 focus:border-champagne-600 outline-none text-sm text-espresso-950 bg-champagne-50/20"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-900 mb-1">
                  Email Address (Optional)
                </label>
                <input 
                  type="email"
                  placeholder="For appointments and receipts"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-champagne-300 focus:border-champagne-600 outline-none text-sm text-espresso-950 bg-champagne-50/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Profile...' : 'Activate Privilege Profile'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

