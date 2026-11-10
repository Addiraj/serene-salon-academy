import React from 'react';
import { ArrowRight } from 'lucide-react';
import { InstagramIcon } from './SocialIcons';

const LOOKBOOK_ITEMS = [
  {
    id: 'srv-bridal-hd',
    title: 'Bridal & Navratri Early-Bird Makeovers',
    category: 'Bridal & Festive',
    image: '/images/lookbook-bridal.jpg',
    startingPrice: 'From ₹2,200',
    description: 'Waterproof HD & Airbrush finish with traditional hairdo, eye lenses, lashes, and chaniya choli pinning.'
  },
  {
    id: 'srv-acrylic-perm',
    title: 'Permanent Acrylic Nail Extensions & Gel Art',
    category: 'Nail Artistry',
    image: '/images/lookbook-nails.jpg',
    startingPrice: 'From ₹1,400',
    description: 'Custom sculpted permanent acrylic extensions topped with chip-free gel colors, chrome, French tips, or 3D art.'
  },
  {
    id: 'srv-hair-spa',
    title: 'Insta Care Hair Spa & Dimensional Highlights',
    category: 'Hair Care & Spa',
    image: '/images/lookbook-hair.jpg',
    startingPrice: 'From ₹1,450',
    description: 'Specialty deep conditioning for long hair and bond-strengthened balayage highlights that leave locks glossy and revived.'
  }
];

export default function LookbookSection({ onQuickAddLook }) {
  return (
    <section id="lookbookSection" className="py-16 bg-champagne-100/60 border-y border-champagne-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-champagne-700">Client Transformations</span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-espresso-950 mt-1">
              Social Media Lookbook & Transformations
            </h2>
            <p className="text-xs sm:text-sm text-espresso-800/80 mt-1">
              Follow <strong>@serenesalonacademy</strong> on Instagram for daily beauty reels, nail art, and bridal transformations.
            </p>
          </div>

          <a 
            href="https://www.instagram.com/serenesalonacademy/?hl=en" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-white border border-champagne-300 text-espresso-900 text-xs font-bold hover:bg-champagne-50 transition shadow-sm inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <InstagramIcon className="w-4 h-4 text-pink-600" />
            <span>@serenesalonacademy ↗</span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LOOKBOOK_ITEMS.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl overflow-hidden border border-champagne-200 shadow-sm hover:shadow-md transition duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                  <div className="absolute top-3 left-3 bg-espresso-950/80 text-champagne-300 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-champagne-400/30">
                    {item.category}
                  </div>
                </div>

                <div className="p-6 space-y-2">
                  <h3 className="font-editorial text-2xl font-bold text-espresso-950">
                    {item.title}
                  </h3>
                  <p className="text-xs text-espresso-800/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-3 border-t border-champagne-200 flex items-center justify-between">
                  <span className="font-bold text-sm text-espresso-900">{item.startingPrice}</span>
                  <button 
                    type="button" 
                    onClick={() => onQuickAddLook(item.id)}
                    className="text-xs font-bold text-champagne-800 hover:text-champagne-950 underline underline-offset-4 flex items-center gap-1"
                  >
                    <span>Book This Look</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
