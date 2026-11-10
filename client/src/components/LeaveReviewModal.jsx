import React, { useState } from 'react';
import { X, Star } from 'lucide-react';

export default function LeaveReviewModal({ isOpen, onClose, onReviewSuccess, showToast }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [tag, setTag] = useState('Hygienic salon');
  const [quote, setQuote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) {
      alert('Please fill in your name and review details.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: name.trim(),
          rating: Number(rating),
          source: 'Verified Client Website Testimonial',
          tags: [tag, 'Verified Guest'],
          quote: quote.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Thank you! Your verified review has been submitted.');
        onReviewSuccess();
        onClose();
      }
    } catch (err) {
      alert('Error submitting review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-champagne-300 space-y-4">
        
        <div className="flex items-center justify-between border-b border-champagne-200 pb-3">
          <h3 className="font-editorial text-2xl font-bold text-espresso-950">Share Your Experience</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name *</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Shah" 
              className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Star Rating</label>
              <select 
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500 font-semibold text-amber-600"
              >
                <option value={5}>5.0 ★★★★★</option>
                <option value={4}>4.0 ★★★★☆</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Highlight</label>
              <select 
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500"
              >
                <option value="Hygienic salon">Hygienic salon</option>
                <option value="Experienced staff">Experienced staff</option>
                <option value="Clean equipment">Clean equipment</option>
                <option value="Reasonably priced">Reasonably priced</option>
                <option value="Luxurious vibe">Luxurious vibe</option>
                <option value="Great offers">Great offers</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Review *</label>
            <textarea 
              required 
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Tell us how you enjoyed your treatment, the clinical hygiene, and the stylists!" 
              className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-espresso-900 text-champagne-200 text-xs font-bold hover:bg-espresso-950 transition shadow"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
