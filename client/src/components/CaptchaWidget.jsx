import React, { useState } from 'react';
import { Check, ShieldCheck, Loader2 } from 'lucide-react';

export default function CaptchaWidget({ onVerify, isVerified = false, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(isVerified);

  const handleClick = () => {
    if (verified || loading) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setVerified(true);
      const token = 'captcha-tok-' + Math.random().toString(36).substring(2, 10);
      if (onVerify) {
        onVerify(token);
      }
    }, 750);
  };

  return (
    <div 
      className={`border border-champagne-300/80 bg-champagne-50/70 hover:bg-white rounded-xl p-3.5 flex items-center justify-between shadow-xs transition duration-200 select-none ${className}`}
    >
      <div 
        onClick={handleClick}
        className={`flex items-center gap-3 cursor-pointer ${verified ? 'cursor-default' : ''}`}
      >
        <button
          type="button"
          aria-label="Verification checkbox"
          className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
            verified 
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
              : loading 
                ? 'border-champagne-500 bg-white' 
                : 'border-champagne-400 bg-white hover:border-champagne-600'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-champagne-700 animate-spin" />
          ) : verified ? (
            <Check className="w-4.5 h-4.5 stroke-[3]" />
          ) : null}
        </button>

        <span className="text-xs font-medium text-espresso-900 tracking-tight">
          {loading ? 'Verifying human security...' : verified ? 'Verification Complete' : "I'm not a robot"}
        </span>
      </div>

      {/* Cloudflare / reCAPTCHA badge styling */}
      <div className="flex flex-col items-end text-[9px] text-espresso-800/60 leading-tight">
        <div className="flex items-center gap-1 font-semibold tracking-wider text-[10px] text-espresso-950 uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-champagne-600" />
          <span>RECAPTCHA</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] text-espresso-800/50">
          <span>Privacy</span>
          <span>•</span>
          <span>Terms</span>
        </div>
      </div>
    </div>
  );
}

