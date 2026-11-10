import React, { useState } from 'react';
import { Calendar, Crown, ShoppingBag, Menu, X, Sparkles, User, Award } from 'lucide-react';

export default function Navbar({ 
  offers, 
  cartCount, 
  onOpenCart, 
  onOpenMyBookings, 
  onToggleAdmin, 
  isAdminView,
  currentUser,
  onNavigate,
  onOpenProfile
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const bannerOffer = offers.find(o => o.isBanner && o.active) || offers.find(o => o.active);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Dynamic Festive Announcement Bar */}
      <aside className="bg-espresso-950 text-champagne-200 text-xs py-2 px-4 text-center border-b border-champagne-800/40 relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {bannerOffer ? (
            <>
              <span className="px-2 py-0.5 rounded-full bg-champagne-500/20 text-champagne-300 font-bold border border-champagne-500/30 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-champagne-400" />
                {bannerOffer.highlightBadge || 'Festive Privilege'}
              </span>
              <span className="font-bold text-champagne-100">{bannerOffer.title}:</span>
              <span className="text-champagne-200">{bannerOffer.description || `Get ${bannerOffer.discountPercent}% Off!`}</span>
              <span className="px-2 py-0.5 rounded bg-champagne-500 text-espresso-950 font-mono font-bold text-[11px] shadow">
                Code: {bannerOffer.code}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold tracking-wide">Vadodara's Clinical-Sterilization Sanctuary & Beauty Academy</span>
              <span className="hidden sm:inline text-champagne-300">• FF 16, Raama Emperro, Manjalpur</span>
            </div>
          )}
        </div>
      </aside>

      {/* Sticky Main Navigation */}
      <header className="sticky top-0 z-40 glass-panel border-b border-champagne-200/80 shadow-xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Monogram Crest */}
          <div 
            onClick={() => {
              if (isAdminView) onToggleAdmin(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full border border-champagne-400/80 bg-espresso-950 flex items-center justify-center text-champagne-300 font-serif text-2xl font-bold shadow-md group-hover:scale-105 transition">
              S
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-espresso-950 leading-none">
                Serene
              </span>
              <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-champagne-700 mt-0.5">
                Salon & Academy • Vadodara
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          {!isAdminView && (
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-espresso-800">
              <button onClick={() => scrollToSection('servicesSection')} className="hover:text-champagne-800 transition py-1">Rate Card</button>
              <button onClick={() => scrollToSection('hygieneSection')} className="hover:text-champagne-800 transition py-1">5-Pillar Hygiene</button>
              <button onClick={() => scrollToSection('academySection')} className="hover:text-champagne-800 transition py-1">Beauty Academy</button>
              <button onClick={() => scrollToSection('lookbookSection')} className="hover:text-champagne-800 transition py-1">Lookbook</button>
              <button onClick={() => scrollToSection('reviewsSection')} className="hover:text-champagne-800 transition py-1">5.0 ★ Reviews</button>
            </nav>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Enrich-Style OTP Customer Authentication Pill */}
            {!isAdminView && (
              currentUser ? (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-champagne-100 hover:bg-champagne-200 border border-champagne-300 shadow-xs transition group"
                  title="View Serene Privilege Profile & Appointments"
                >
                  <img 
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                    alt={currentUser.name} 
                    className="w-6 h-6 rounded-full object-cover border border-champagne-400 group-hover:scale-105 transition"
                  />
                  <span className="text-xs font-bold text-espresso-950 hidden sm:inline">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <span className="hidden md:inline px-1.5 py-0.5 rounded bg-champagne-500 text-espresso-950 text-[10px] font-bold">
                    {currentUser.loyaltyPoints || 150} pts
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <button 
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-espresso-950 hover:text-champagne-800 hover:bg-champagne-100/80 transition"
                  >
                    Sign In
                  </button>
                  <button 
                    type="button"
                    onClick={() => onNavigate('signup')}
                    className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-champagne-100 text-espresso-950 border border-champagne-300 shadow-xs transition"
                  >
                    Sign Up
                  </button>
                </div>
              )
            )}

            {!isAdminView && (
              <button 
                onClick={onOpenMyBookings}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-espresso-800 hover:bg-champagne-200/60 border border-champagne-300 transition"
                title="Lookup Bookings by Phone"
              >
                <Calendar className="w-3.5 h-3.5 text-champagne-700" />
                <span>My Bookings</span>
              </button>
            )}

            <button 
              onClick={() => onToggleAdmin(!isAdminView)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                isAdminView 
                  ? 'bg-espresso-900 text-champagne-200 border-espresso-950 shadow'
                  : 'text-champagne-800 bg-champagne-100 hover:bg-champagne-200 border-champagne-300'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAdminView ? 'Exit Portal' : 'Owner Portal'}</span>
              <span className="sm:hidden">Owner</span>
            </button>

            {!isAdminView && (
              <button 
                onClick={onOpenCart}
                className="relative px-3 sm:px-4 py-2 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-100 text-xs sm:text-sm font-semibold shadow-md transition flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-champagne-300" />
                <span className="hidden sm:inline">Bag</span>
                {cartCount > 0 && (
                  <span className="bg-champagne-500 text-espresso-950 text-[11px] font-bold px-1.5 py-0.2 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile Hamburger */}
            {!isAdminView && (
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-espresso-900 hover:bg-champagne-200/60"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && !isAdminView && (
          <div className="lg:hidden bg-champagne-50 border-b border-champagne-300 px-6 py-4 space-y-3">
            <button onClick={() => scrollToSection('servicesSection')} className="block w-full text-left py-2 font-medium text-espresso-900 hover:text-champagne-800">Rate Card & Treatments</button>
            <button onClick={() => scrollToSection('hygieneSection')} className="block w-full text-left py-2 font-medium text-espresso-900 hover:text-champagne-800">Hospital-Grade Hygiene</button>
            <button onClick={() => scrollToSection('academySection')} className="block w-full text-left py-2 font-medium text-espresso-900 hover:text-champagne-800">Beauty Training Academy</button>
            <button onClick={() => scrollToSection('lookbookSection')} className="block w-full text-left py-2 font-medium text-espresso-900 hover:text-champagne-800">Lookbook Transformations</button>
            <button onClick={() => scrollToSection('reviewsSection')} className="block w-full text-left py-2 font-medium text-espresso-900 hover:text-champagne-800">5.0 ★ Client Reviews</button>
            <button onClick={() => { onOpenMyBookings(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-medium text-espresso-900 hover:text-champagne-800">Lookup My Bookings</button>
            
            {currentUser ? (
              <button onClick={() => { onOpenProfile(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-bold text-champagne-800 border-t border-champagne-200 pt-3">
                👤 My Privilege Account ({currentUser.name})
              </button>
            ) : (
              <div className="border-t border-champagne-200 pt-3 space-y-2">
                <button onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-bold text-espresso-950 hover:text-champagne-800">
                  🔑 Sign In with Mobile OTP
                </button>
                <button onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-bold text-champagne-800 hover:text-champagne-950">
                  ✨ Create Account (Claim 150 Points)
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
