import React, { useState } from 'react';
import { Star, MessageSquarePlus, Check } from 'lucide-react';

const TAGS = [
  'all',
  'Hygienic salon',
  'Clean equipment',
  'Experienced staff',
  'Reasonably priced',
  'Great offers'
];

export default function ReviewsSection({ reviews, onOpenLeaveReview }) {
  const [selectedTag, setSelectedTag] = useState('all');

  const filtered = selectedTag === 'all'
    ? reviews
    : reviews.filter(r => (r.tags || []).includes(selectedTag));

  return (
    <section id="reviewsSection" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-champagne-700">Grounded Trust</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-espresso-950 mt-1">
            Rated 5.0 ★ Across 1,551+ Reviews
          </h2>
          <p className="text-xs sm:text-sm text-espresso-800/80 mt-1 max-w-xl">
            Verified client testimonials highlighting cleanliness, friendly hospitality, and luxury hair & skin treatments in Manjalpur, Vadodara.
          </p>
        </div>

        <button 
          onClick={onOpenLeaveReview}
          className="px-4 py-2.5 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 text-xs font-bold transition shadow-sm self-start sm:self-auto flex items-center gap-2"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>+ Leave a Review</span>
        </button>
      </div>

      {/* Review Tag Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedTag === tag
                ? 'bg-espresso-900 text-champagne-200 shadow'
                : 'bg-white border border-champagne-300 text-espresso-800 hover:bg-champagne-100'
            }`}
          >
            {tag === 'all' ? 'All Reviews' : tag}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(r => (
          <div 
            key={r.id}
            className="bg-champagne-50/70 border border-champagne-200 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition duration-300"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(r.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-espresso-800/60 font-medium">
                  {r.source || 'Verified Client'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-espresso-900 leading-relaxed italic">
                "{r.quote}"
              </p>
            </div>

            <div className="pt-2 border-t border-champagne-200/60">
              <div className="font-bold text-xs text-espresso-950">{r.reviewer}</div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(r.tags || []).map((t, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-white text-champagne-900 border border-champagne-200 text-[10px] font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
