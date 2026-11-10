import React, { useState } from 'react';
import { Sparkles, Shield, Droplets, RefreshCw } from 'lucide-react';

const PROTOCOLS = [
  {
    id: 'autoclave',
    icon: Shield,
    title: 'Autoclave & UV-C Tool Pouches',
    short: 'Medical grade sealed instrument pouches opened before your eyes.',
    detail: 'Autoclave Class B Sterilization cycle at 134°C eliminates 100% of bacterial and viral spores on shears, cuticle nippers, and extractors. Sealed in medical pouches that are opened only in front of each guest.'
  },
  {
    id: 'disposable',
    icon: Sparkles,
    title: 'Single-Use Disposable Kits',
    short: 'Fresh capes, biodegradable towels, and disposable pedicure tub liners.',
    detail: 'Zero cross-contamination. Every client receives a fresh, sanitized biodegradable cape, single-use neck strips, wooden waxing spatulas, and disposable pedicure tub liners.'
  },
  {
    id: 'monodose',
    icon: Droplets,
    title: 'Mono-Dose Authentic Products',
    short: 'Zero bulk decanting. 100% authentic sealed international cosmetic formulas.',
    detail: 'Factory-sealed mono-dose ampoules and facial sachets prevent product oxidation, bacterial contamination, or dilution. Only authentic international salon brands are utilized.'
  },
  {
    id: 'disinfection',
    icon: RefreshCw,
    title: 'Between-Guest Chair Disinfection',
    short: 'Chairs, backwash units, and manicure stations wiped between every guest visit.',
    detail: 'Styling chairs, shampoo basins, UV lamps, and manicure stations undergo hospital-grade alcohol surface wipe disinfection immediately after every appointment.'
  }
];

export default function HygieneSection() {
  const [activeProtocol, setActiveProtocol] = useState(PROTOCOLS[0]);

  return (
    <section id="hygieneSection" className="py-16 sm:py-20 bg-espresso-950 text-champagne-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-champagne-400">Clinical-Standard Guarantee</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-champagne-100">
            Our 5-Pillar Gold Hygiene & Sterilization Protocol
          </h2>
          <p className="text-xs sm:text-sm text-champagne-200/80 font-light">
            Why 1,551+ Vadodara women trust Serene. Click any protocol below to view our strict station preparation procedure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROTOCOLS.map(p => {
            const Icon = p.icon;
            const isSelected = activeProtocol.id === p.id;
            return (
              <button 
                key={p.id}
                type="button" 
                onClick={() => setActiveProtocol(p)}
                className={`text-left p-6 rounded-2xl transition duration-300 space-y-3 border ${
                  isSelected
                    ? 'bg-espresso-900 border-champagne-400 ring-2 ring-champagne-400/40 shadow-xl'
                    : 'bg-espresso-900/60 border-champagne-800/80 hover:border-champagne-500 hover:bg-espresso-900'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-champagne-500/20 text-champagne-300 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-champagne-200">{p.title}</h3>
                <p className="text-xs text-champagne-300/70 leading-relaxed">{p.short}</p>
              </button>
            );
          })}
        </div>

        <div className="p-5 rounded-2xl bg-champagne-950/90 border border-champagne-600/50 text-xs text-champagne-200 text-center max-w-2xl mx-auto shadow-inner leading-relaxed">
          <strong className="text-champagne-300 font-bold block mb-1">Selected Protocol Procedure:</strong>
          {activeProtocol.detail}
        </div>
      </div>
    </section>
  );
}
