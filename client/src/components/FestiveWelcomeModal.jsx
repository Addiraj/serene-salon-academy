import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';

export default function FestiveWelcomeModal({ isOpen, onClose, offer, onClaimAndBook, showToast }) {
  if (!isOpen || !offer) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.code);
    showToast(`Coupon code ${offer.code} copied!`);
    onClose();
  };

  const handleBook = () => {
    onClaimAndBook(offer.code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-champagne-50 via-white to-champagne-50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-champagne-400 text-center space-y-4 relative animate-scale-up">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-champagne-100 hover:bg-champagne-200 text-espresso-950 font-bold flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-champagne-100 border border-champagne-300 flex items-center justify-center text-champagne-800 text-2xl mx-auto shadow-inner">
          <Sparkles className="w-7 h-7 text-champagne-600" />
        </div>

        <div>
          <span className="text-[10px] font-bold text-champagne-700 uppercase tracking-widest bg-champagne-200/60 px-2.5 py-0.5 rounded-full border border-champagne-300">
            Vadodara Festive Privilege
          </span>
          <h3 className="font-editorial text-3xl font-bold text-espresso-950 mt-1">
            {offer.title || 'Festive Glamour & Glow'}
          </h3>
          <p className="text-xs text-espresso-800/80 mt-1">
            {offer.description || `Enjoy flat ${offer.discountPercent}% off on our signature luxury rituals and cosmetology courses!`}
          </p>
        </div>

        <div className="p-3.5 bg-champagne-100/70 rounded-2xl border border-dashed border-champagne-400 flex items-center justify-between">
          <div className="text-left">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Festive Coupon Code</div>
            <div className="font-mono text-lg font-extrabold text-espresso-950">{offer.code}</div>
          </div>
          <button 
            type="button" 
            onClick={handleCopy}
            className="px-3.5 py-2 rounded-xl bg-champagne-600 hover:bg-champagne-700 text-white font-bold text-xs shadow transition"
          >
            Claim & Copy
          </button>
        </div>

        <div className="pt-1">
          <button 
            type="button" 
            onClick={handleBook}
            className="w-full py-3.5 bg-espresso-900 hover:bg-espresso-950 text-champagne-200 rounded-xl font-bold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Apply Coupon & Reserve Sanctuary Slot</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[10px] text-slate-400">
          * Valid for online appointments this season. Autoclave clinical sterilization standard guaranteed.
        </div>
      </div>
    </div>
  );
}
