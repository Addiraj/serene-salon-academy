import React, { useState, useMemo } from 'react';
import { Search, Clock, ShieldCheck, Check, Plus, ShoppingBag, Sparkles, Filter, X } from 'lucide-react';

const CATEGORIES = [
  'All Services',
  'Facials & Clean-Up',
  'Hydra & Clinical',
  'Hair Cut & Spa',
  'Hair Color & Styling',
  'Bridal & Party Makeup',
  'Nail Artistry',
  'Waxing & Threading',
  'Body Spa & Pedicure'
];

export default function ServicesSection({ services = [], cart = [], onToggleService, onOpenCart }) {
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { 'All Services': services.length };
    CATEGORIES.slice(1).forEach(cat => {
      counts[cat] = services.filter(s => s.category === cat).length;
    });
    return counts;
  }, [services]);

  // Compute available subcategories for the active category
  const availableSubCategories = useMemo(() => {
    if (selectedCategory === 'All Services') {
      const set = new Set();
      services.forEach(s => {
        if (s.subCategory) set.add(s.subCategory);
      });
      return ['All', ...Array.from(set)];
    }
    const set = new Set();
    services
      .filter(s => s.category === selectedCategory)
      .forEach(s => {
        if (s.subCategory) set.add(s.subCategory);
      });
    return ['All', ...Array.from(set)];
  }, [services, selectedCategory]);

  // Handle switching category
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory('All');
  };

  // Filtered and sorted services
  const filteredServices = useMemo(() => {
    return services
      .filter(s => {
        const matchCat = selectedCategory === 'All Services' || s.category === selectedCategory;
        const matchSubCat = selectedSubCategory === 'All' || s.subCategory === selectedSubCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchQuery = !q ||
          s.name.toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q) ||
          (s.category || '').toLowerCase().includes(q) ||
          (s.subCategory || '').toLowerCase().includes(q);
        return matchCat && matchSubCat && matchQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'duration') return a.duration - b.duration;
        return 0;
      });
  }, [services, selectedCategory, selectedSubCategory, searchQuery, sortBy]);

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-champagne-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
            <span>Official Price List & Clinical Treatment Menu</span>
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-espresso-950 mt-1">
            Signature Salon Rituals & Treatments
          </h2>
          <p className="text-xs sm:text-sm text-espresso-800/80 mt-1.5 max-w-2xl">
            Explore authentic services from our master-trained cosmetologists. Every ritual includes photographic transparency and 100% autoclave sterilization pouches opened live before your appointment.
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
              placeholder="Search facials, balayage, waxing..."
              className="text-xs rounded-xl border border-champagne-300 py-2.5 pl-9 pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500 w-56 sm:w-64 shadow-xs"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs rounded-xl border border-champagne-300 py-2.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500 shadow-xs font-medium text-espresso-900 cursor-pointer"
          >
            <option value="recommended">Recommended Rituals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="duration">Shortest Duration</option>
          </select>
        </div>
      </div>

      {/* Main Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {CATEGORIES.map(cat => {
          const count = categoryCounts[cat] || 0;
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? 'bg-espresso-950 text-champagne-100 shadow-md transform scale-[1.02]'
                  : 'bg-white text-espresso-800 hover:bg-champagne-100 border border-champagne-300/80 shadow-xs'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-champagne-500/20 text-champagne-200' : 'bg-champagne-100 text-espresso-900'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subcategory Chips (when multiple subcategories exist) */}
      {availableSubCategories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3 text-champagne-600" />
            <span>Filter:</span>
          </span>
          {availableSubCategories.map(sub => {
            const isSubActive = selectedSubCategory === sub;
            return (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubCategory(sub)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition duration-150 ${
                  isSubActive
                    ? 'bg-champagne-600 text-white font-bold shadow-xs'
                    : 'bg-champagne-50/70 hover:bg-champagne-100 text-espresso-800 border border-champagne-200/80'
                }`}
              >
                {sub === 'All' ? `All ${selectedCategory === 'All Services' ? 'Types' : selectedCategory}` : sub}
              </button>
            );
          })}
        </div>
      )}

      {/* Result Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-6 px-1">
        <span>
          Showing <strong className="text-espresso-950">{filteredServices.length}</strong> rituals
          {selectedCategory !== 'All Services' && <> in <strong className="text-champagne-700">{selectedCategory}</strong></>}
          {selectedSubCategory !== 'All' && <> • <span className="font-semibold">{selectedSubCategory}</span></>}
          {searchQuery && <> for "<span className="italic">{searchQuery}</span>"</>}
        </span>
        {(selectedCategory !== 'All Services' || selectedSubCategory !== 'All' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All Services');
              setSelectedSubCategory('All');
              setSearchQuery('');
            }}
            className="text-champagne-700 hover:text-champagne-900 font-semibold underline text-xs"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Services Grid (Enrich-Style Image-Based Visual Cards) */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-champagne-200 shadow-sm">
          <p className="font-editorial text-2xl font-bold text-espresso-900">No matching rituals found</p>
          <p className="text-xs text-espresso-800/70 mt-1">Try clearing your search query or switching to another category.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All Services');
              setSelectedSubCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 px-5 py-2 rounded-xl bg-espresso-950 text-champagne-200 text-xs font-semibold hover:bg-black"
          >
            View All Services
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map(s => {
            const inCart = cart.includes(s.id);
            const serviceImg = s.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';

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
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 via-transparent to-black/30"></div>

                  {/* Overlaid Category & Subcategory Tags */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-full bg-espresso-950/80 backdrop-blur-md text-champagne-200 text-[10px] font-bold tracking-wide border border-champagne-500/30">
                        {s.category}
                      </span>
                      {s.subCategory && (
                        <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-espresso-900 text-[9px] font-semibold">
                          {s.subCategory}
                        </span>
                      )}
                    </div>
                    {s.badge && (
                      <span className="text-[10px] font-bold text-white bg-red-600/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm shrink-0">
                        {s.badge}
                      </span>
                    )}
                  </div>

                  {/* Price Tag Overlaid on Image Corner */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-champagne-200 text-right">
                    <div className="text-[9px] uppercase font-bold text-espresso-800/70 tracking-wider">Official Rate</div>
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
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-champagne-500 to-champagne-600 hover:from-champagne-400 hover:to-champagne-500 text-espresso-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
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
