import React, { useState, useMemo } from 'react';
import { Search, Clock, ShieldCheck, Check, Plus, ShoppingBag, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All Services',
  'Skin & Facials',
  'Hair Care & Spa',
  'Nail Artistry',
  'Bridal & Festive',
  'Waxing & Threading'
];

export default function ServicesSection({ services, cart, onToggleService, onOpenCart }) {
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchCat = selectedCategory === 'All Services' || s.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        s.name.toLowerCase().includes(q) || 
        (s.description || '').toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'duration') return a.duration - b.duration;
      return 0;
    });
  }, [services, selectedCategory, searchQuery, sortBy]);

  const cartTotal = useMemo(() => {
    const items = cart.map(id => services.find(s => s.id === id)).filter(Boolean);
    return items.reduce((sum, i) => sum + i.price, 0);
  }, [cart, services]);

  const cartDuration = useMemo(() => {
    const items = cart.map(id => services.find(s => s.id === id)).filter(Boolean);
    return items.reduce((sum, i) => sum + i.duration, 0);
  }, [cart, services]);

  return (
    <section id="servicesSection" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-champagne-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
            <span>Enrich-Grade Visual Rate Card & Treatment Menu</span>
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-espresso-950 mt-1">
            Signature Salon Rituals & Treatments
          </h2>
          <p className="text-xs sm:text-sm text-espresso-800/80 mt-1.5 max-w-xl">
            Authentic botanical and dermatological formulations with photographic transparency, backed by Vadodara’s highest autoclave sterilization standards.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-champagne-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facials, hair spa, nails..."
              className="text-xs rounded-xl border border-champagne-300 py-2.5 pl-9 pr-3.5 bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500 w-52 sm:w-64 shadow-xs"
            />
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs rounded-xl border border-champagne-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500 shadow-xs font-medium text-espresso-900"
          >
            <option value="recommended">Recommended Rituals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="duration">Shortest Duration</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition duration-200 ${
              selectedCategory === cat
                ? 'bg-espresso-950 text-champagne-100 shadow-sm'
                : 'bg-white text-espresso-800 hover:bg-champagne-100 border border-champagne-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid (Enrich-Style Image-Based Visual Cards) */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-champagne-200 shadow-sm">
          <p className="font-editorial text-2xl font-bold text-espresso-900">No matching rituals found</p>
          <p className="text-xs text-espresso-800/70 mt-1">Try clearing your search query or switching to "All Services".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map(s => {
            const inCart = cart.includes(s.id);
            const serviceImg = s.image || '/images/hero-sanctuary.jpg';

            return (
              <div 
                key={s.id}
                className={`bg-white rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between group hover:shadow-xl ${
                  inCart 
                    ? 'border-champagne-500 ring-2 ring-champagne-400/50 shadow-md' 
                    : 'border-champagne-200/90 shadow-sm'
                }`}
              >
                {/* 1. High-Resolution Photographic Header */}
                <div className="relative h-52 w-full overflow-hidden bg-espresso-900">
                  <img 
                    src={serviceImg} 
                    alt={s.name}
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 via-transparent to-black/30"></div>

                  {/* Overlaid Category & Badge Tags */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-espresso-950/80 backdrop-blur-md text-champagne-200 text-[10px] font-bold tracking-wide border border-champagne-500/30">
                      {s.category}
                    </span>
                    <span className="text-[10px] font-bold text-white bg-red-600/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                      {s.badge || 'Vadodara Special'}
                    </span>
                  </div>

                  {/* Price Tag Overlaid on Image Corner */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-champagne-200">
                    <div className="text-[9px] uppercase font-bold text-espresso-800/70 tracking-wider">Starting at</div>
                    <div className="font-editorial text-xl font-bold text-espresso-950 leading-none">
                      ₹{s.price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Duration Tag */}
                  <div className="absolute bottom-3 left-3 bg-espresso-950/80 backdrop-blur-md text-champagne-300 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border border-champagne-800/60">
                    <Clock className="w-3.5 h-3.5 text-champagne-400" />
                    <span>{s.duration} mins</span>
                  </div>
                </div>

                {/* 2. Treatment Details Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-editorial text-2xl font-bold text-espresso-950 leading-snug group-hover:text-champagne-800 transition">
                      {s.name}
                    </h3>
                    <p className="text-xs text-espresso-800/80 leading-relaxed line-clamp-3">
                      {s.description}
                    </p>
                  </div>

                  {/* Clinical Hygiene Guarantee Box */}
                  <div className="pt-2">
                    <div className="text-[11px] text-champagne-950 font-medium bg-champagne-50/80 p-2.5 rounded-xl border border-champagne-200/80 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Sterilization:</strong> {s.hygieneNote || 'Autoclaved Sealed Pouches Opened Live'}</span>
                    </div>
                  </div>

                  {/* 3. Action Footer */}
                  <div className="pt-4 border-t border-champagne-200/70 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleService(s.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                        inCart
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-gradient-to-r from-espresso-950 to-espresso-900 text-champagne-100 hover:from-black hover:to-espresso-950'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Selected in Bag</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to Booking Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Floating Checkout Bag Strip (When Cart has items) */}
      {cart.length > 0 && (
        <aside className="sticky bottom-6 mt-10 z-30 max-w-3xl mx-auto">
          <div className="bg-espresso-950 text-champagne-100 p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-champagne-400 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-champagne-500 text-espresso-950 flex items-center justify-center font-bold text-lg shadow-inner">
                {cart.length}
              </div>
              <div>
                <div className="text-xs text-champagne-300 font-semibold tracking-wide">
                  {cart.length} Service{cart.length > 1 ? 's' : ''} Selected • {cartDuration} Mins
                </div>
                <div className="font-editorial text-2xl font-bold text-white">
                  Total: ₹{cartTotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCart}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-champagne-500 to-champagne-600 hover:from-champagne-400 hover:to-champagne-500 text-espresso-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Review Bag & Select Slot →</span>
            </button>
          </div>
        </aside>
      )}

    </section>
  );
}
