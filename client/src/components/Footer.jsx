import React from 'react';
import { Phone, MapPin, Clock, Crown } from 'lucide-react';
import { InstagramIcon, FacebookIcon } from './SocialIcons';

export default function Footer({ onToggleAdmin, onNavigate, settings }) {
  return (
    <footer className="bg-espresso-950 text-champagne-100 border-t border-champagne-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Brand & Story */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {settings?.logoUrl ? (
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-champagne-400 via-champagne-200 to-amber-500 shadow-md flex items-center justify-center overflow-hidden shrink-0 bg-white">
                <img 
                  src={settings.logoUrl} 
                  alt={settings?.salonName || 'Serene Salon & Academy'} 
                  className="w-full h-full object-contain filter drop-shadow-xs"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full rounded-full bg-champagne-600 items-center justify-center text-espresso-950 font-serif font-bold text-xl">
                  S
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-champagne-600 flex items-center justify-center text-espresso-950 font-serif font-bold text-xl shrink-0">
                S
              </div>
            )}
            <span className="font-editorial text-2xl font-bold text-champagne-100">
              {settings?.salonName || 'Serene Salon & Academy'}
            </span>
          </div>
          <p className="text-xs text-champagne-200/80 leading-relaxed font-light">
            Vadodara’s premier clinical-standard women's luxury salon and CIDESCO/Lakmé-benchmarked cosmetology training academy led by <strong>Rashmi Sah</strong>.
          </p>
          <div className="pt-2 space-y-2">
            {onNavigate && (
              <div className="flex items-center gap-3 text-xs">
                <button 
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="text-champagne-300 hover:text-white underline font-medium"
                >
                  Customer Sign In
                </button>
                <span className="text-champagne-600">•</span>
                <button 
                  type="button"
                  onClick={() => onNavigate('signup')}
                  className="text-champagne-300 hover:text-white underline font-medium"
                >
                  Join Privilege Club (+150 Pts)
                </button>
              </div>
            )}
            <button 
              type="button"
              onClick={() => onToggleAdmin(true)}
              className="text-xs font-semibold text-champagne-400 hover:text-champagne-300 underline flex items-center gap-1.5 pt-1"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Salon Owner Admin Dashboard ↗</span>
            </button>
          </div>
        </div>

        {/* Salon Hours & Timings */}
        <div className="space-y-3">
          <h4 className="font-editorial text-xl font-bold text-champagne-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-champagne-400" />
            <span>Opening Hours</span>
          </h4>
          <div className="text-xs text-champagne-200/80 space-y-1.5">
            <p><strong>Monday – Sunday:</strong></p>
            <p className="font-mono text-champagne-300 text-sm">10:00 AM – 08:30 PM</p>
            <p className="text-[11px] text-champagne-400 pt-2 leading-relaxed">
              Hospital-grade autoclave sterilization cycles run 30 minutes prior to opening and following every booking.
            </p>
          </div>
        </div>

        {/* Salon Address & Location */}
        <div className="space-y-3">
          <h4 className="font-editorial text-xl font-bold text-champagne-200 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-champagne-400" />
            <span>Vadodara Sanctuary</span>
          </h4>
          <p className="text-xs text-champagne-200/80 leading-relaxed">
            FF 16, Raama Emperro, Near Shell Petrol Pump & Kabir Complex, Manjalpur / Makarpura Road, Vadodara, Gujarat 390010
          </p>
          <div className="pt-2 text-xs">
            <a 
              href="https://www.justdial.com/Vadodara/Serene-Salon-Academy-Near-Shell-Petrol-Pump-Makarpura-Industrial-Estate/0265PX265-X265-220827151238-Q4G8_BZDET" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-champagne-400 hover:underline block"
            >
              View on Justdial (5.0 ★ Rated) ↗
            </a>
          </div>
        </div>

        {/* Direct Contact & Social */}
        <div className="space-y-3">
          <h4 className="font-editorial text-xl font-bold text-champagne-200 flex items-center gap-2">
            <Phone className="w-4 h-4 text-champagne-400" />
            <span>Direct Contact</span>
          </h4>
          <div className="text-xs space-y-2">
            <p>
              <span className="text-champagne-400">Phone:</span>
              <a href="tel:+916203060789" className="font-bold text-champagne-200 hover:underline ml-1">
                +91 6203060789
              </a>
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://www.instagram.com/serenesalonacademy/?hl=en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-champagne-900/60 border border-champagne-700/60 flex items-center justify-center text-champagne-300 hover:bg-champagne-800 transition"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://www.facebook.com/Serensalonandacademy/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-champagne-900/60 border border-champagne-700/60 flex items-center justify-center text-champagne-300 hover:bg-champagne-800 transition"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
            </div>

            <div className="pt-2">
              <a 
                href="https://wa.me/916203060789?text=Hello%20Serene%20Salon%20%26%20Academy!%20I%20would%20like%20to%20inquire%20about%20booking%20an%20appointment." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow"
              >
                <span>Chat on WhatsApp</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-champagne-900/60 py-6 text-center text-xs text-champagne-300/60">
        © 2026 Serene Salon & Academy. All Rights Reserved. • FF 16 Raama Emperro, Manjalpur, Vadodara.
      </div>
    </footer>
  );
}
