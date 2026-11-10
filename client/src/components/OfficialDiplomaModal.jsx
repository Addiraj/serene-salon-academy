import React from 'react';
import { X, Printer } from 'lucide-react';

export default function OfficialDiplomaModal({ isOpen, onClose, cert }) {
  if (!isOpen || !cert) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('printableReactCertArea').innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    printWindow.document.write(`
      <html>
        <head>
          <title>Graduation Diploma - Serene Academy</title>
          <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Cormorant Garamond', serif; padding: 40px; background: #fff; color: #181210; text-align: center; }
            .border-4 { border: 6px double #C59653; padding: 40px; border-radius: 16px; background: #FAF7F2; }
            .text-3xl { font-size: 28px; font-weight: bold; }
            .text-4xl { font-size: 34px; font-weight: bold; }
            .flex { display: flex; justify-content: space-around; margin-top: 30px; border-top: 1px solid #D2AC74; padding-top: 20px; font-family: sans-serif; font-size: 13px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="border-4">
            ${printContent}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-espresso-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-champagne-400 space-y-5 max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-champagne-200 pb-2">
          <span className="text-xs font-bold text-champagne-700 uppercase tracking-wider">Official Verified Diploma</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Certificate */}
        <div 
          id="printableReactCertArea" 
          className="relative p-8 sm:p-10 rounded-2xl border-4 border-double border-champagne-400 bg-gradient-to-b from-champagne-50 via-white to-champagne-50 text-center space-y-5 shadow-lg"
        >
          <div className="w-16 h-16 rounded-full bg-espresso-950 text-champagne-300 font-serif font-bold text-3xl flex items-center justify-center mx-auto border-2 border-champagne-400 shadow">
            S
          </div>

          <div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-widest text-espresso-950 uppercase">
              Serene Professional Beauty Academy
            </h2>
            <p className="text-[11px] font-semibold text-champagne-700 tracking-widest uppercase mt-0.5">
              FF 16, Raama Emperro, Manjalpur, Vadodara • Centre of Cosmetology & Aesthetic Mastery
            </p>
          </div>

          <div className="text-xs text-slate-600 italic">This is to certify that</div>

          <div>
            <h3 className="font-editorial text-3xl sm:text-4xl font-bold text-espresso-950 border-b border-champagne-300 inline-block px-8 pb-1">
              {cert.student}
            </h3>
          </div>

          <div className="text-xs text-slate-700 max-w-lg mx-auto leading-relaxed">
            has successfully satisfied all rigorous theoretical, clinical sterilization, and live model practical requirements for graduation in:
          </div>

          <div className="p-3.5 bg-champagne-100/70 rounded-xl border border-champagne-300 max-w-md mx-auto">
            <h4 className="font-editorial text-xl font-bold text-espresso-950">
              {cert.course}
            </h4>
          </div>

          <div className="flex items-center justify-around gap-4 pt-4 border-t border-champagne-200 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Academic Standing</div>
              <div className="font-bold text-emerald-800 text-sm">{cert.grade}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Certificate ID</div>
              <div className="font-mono font-bold text-espresso-950">{cert.id}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Master Signatory</div>
              <div className="font-serif italic font-bold text-espresso-950 text-sm">Rashmi Sah</div>
              <div className="text-[9px] text-slate-400">Founder & Director</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
          <button 
            type="button" 
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-espresso-900 text-champagne-200 text-xs font-bold hover:bg-espresso-950 transition flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
