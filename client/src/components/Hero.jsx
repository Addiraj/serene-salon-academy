import React, { useState } from 'react';
import { ShieldCheck, Star, Award, CheckCircle2, ArrowRight, Lock } from 'lucide-react';

export default function Hero({ services, onQuickBook, onScrollTo, settings }) {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date(Date.now() + 86400000).toISOString().split('T')[0];
  });
  const [selectedStylist, setSelectedStylist] = useState('Rashmi Sah (Founder & Master Artist)');

  const handleQuickBookSubmit = (e) => {
    e.preventDefault();
    const serviceId = selectedService || (services[0] ? services[0].id : '');
    onQuickBook(serviceId, selectedDate, selectedStylist);
  };

  return (
    <>
      <section className="relative bg-espresso-950 text-white overflow-hidden">
        {/* Visual Background */}
        <div className="absolute inset-0 opacity-40">
          <img 
            src="/images/hero-sanctuary.jpg" 
            alt="Serene Luxury Salon Sanctuary Vadodara" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-espresso-950 via-espresso-950/90 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Editorial Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-1 bg-gradient-to-tr from-champagne-400 via-champagne-200 to-amber-500 shadow-lg flex items-center justify-center overflow-hidden shrink-0 bg-white/95">
                <img 
                  src={settings?.logoUrl || '/images/serene-logo.png'} 
                  alt="Rashmi's Serene Salon & Academy Logo" 
                  className="w-full h-full object-contain filter drop-shadow-xs"
                  onError={(e) => { e.currentTarget.src = '/images/serene-logo.png'; }}
                />
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-champagne-900/60 border border-champagne-500/40 text-champagne-300 text-xs font-semibold backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Medical-Grade Autoclave Sterilization</span>
                <span className="text-champagne-400">• Vadodara Benchmark</span>
              </div>
            </div>

            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-champagne-100">
              Where Clinical Hygiene Meets Couture Beauty & Mastery.
            </h1>

            <p className="text-sm sm:text-base text-champagne-200/80 max-w-xl font-light leading-relaxed">
              Vadodara’s trusted sanctuary for restorative hair rituals, Hydra-Glow medi-facials, permanent acrylic nail artistry, and career-launching cosmetology education led by <strong>Rashmi Sah</strong>.
            </p>

            {/* Grounded Social Proof Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-champagne-300">
              <div className="flex items-center gap-1.5 bg-espresso-900/80 px-3.5 py-2 rounded-xl border border-champagne-700/50">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">5.0 ★</span>
                <span>Across 1,551+ Verified Justdial Reviews</span>
              </div>
              <div className="flex items-center gap-1.5 bg-espresso-900/80 px-3.5 py-2 rounded-xl border border-champagne-700/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Sealed Mono-Dose Treatments</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3.5 pt-4">
              <button 
                onClick={() => onScrollTo('servicesSection')}
                className="px-6 py-3.5 rounded-xl bg-champagne-500 hover:bg-champagne-400 text-espresso-950 font-bold text-sm shadow-lg transition flex items-center gap-2"
              >
                <span>Explore Rate Card & Book</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onScrollTo('academySection')}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-champagne-100 font-semibold text-sm border border-champagne-400/30 backdrop-blur-sm transition"
              >
                Browse Academy Diplomas
              </button>
            </div>
          </div>

          {/* Right Column: Instant Quick-Appointment Finder Card */}
          <div className="lg:col-span-5">
            <form onSubmit={handleQuickBookSubmit} className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-champagne-300/80 text-espresso-900 space-y-4">
              <div className="border-b border-champagne-200 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-champagne-700">Instant Online Slot</span>
                <h2 className="font-editorial text-2xl font-bold text-espresso-950">Reserve Your Sanctuary Slot</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-espresso-800 mb-1">Select Signature Treatment</label>
                  <select 
                    value={selectedService} 
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full text-xs rounded-xl border border-champagne-300 py-2.5 px-3 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} — ₹{s.price.toLocaleString('en-IN')} ({s.duration}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-800 mb-1">Preferred Date</label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full text-xs rounded-xl border border-champagne-300 py-2.5 px-3 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-800 mb-1">Stylist / Artist</label>
                    <select 
                      value={selectedStylist}
                      onChange={(e) => setSelectedStylist(e.target.value)}
                      className="w-full text-xs rounded-xl border border-champagne-300 py-2.5 px-3 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500 font-medium"
                    >
                      <option value="Rashmi Sah (Founder & Master Artist)">Rashmi Sah (Founder)</option>
                      <option value="Senior Skin & Laser Aesthetician">Senior Skin Specialist</option>
                      <option value="Senior Hair & Balayage Expert">Senior Hair Expert</option>
                      <option value="Senior Nail & Lash Technician">Nail & Lash Artist</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-espresso-900 hover:bg-espresso-950 text-champagne-200 rounded-xl font-bold text-xs sm:text-sm tracking-wide shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Continue to Instant Booking</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-espresso-800/70 text-center flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero advance deposit required</span>
                <span>•</span>
                <span>Autoclaved kit assigned</span>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* BENCHMARK EXCELLENCE RIBBON */}
      <section className="bg-champagne-100/90 border-b border-champagne-200 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-espresso-900 text-center">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-champagne-700" />
            <span>100% Autoclaved & Sealed Pouches</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-champagne-700" />
            <span>Strict Zero Double-Dipping Waxing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-champagne-700" />
            <span>Certified Single-Use Disposable Capes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-champagne-700" />
            <span>Lakmé & CIDESCO Benchmarked Academy</span>
          </div>
        </div>
      </section>
    </>
  );
}
