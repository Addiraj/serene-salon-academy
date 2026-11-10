import React, { useState } from 'react';
import { X, Search, Calendar, Clock, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MyBookingsModal({ isOpen, onClose, showToast }) {
  const [query, setQuery] = useState('');
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/my?query=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setBookings([]);
      }
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm(`Are you sure you want to cancel Appointment #${id}?`)) return;
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
        showToast(`Appointment #${id} has been cancelled.`);
      }
    } catch (err) {
      alert('Error updating booking status.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-champagne-300 space-y-4 max-h-[85vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-champagne-200 pb-3">
          <div>
            <span className="text-[10px] font-bold text-champagne-700 uppercase tracking-wider">Client Self-Service</span>
            <h3 className="font-editorial text-2xl font-bold text-espresso-950">Lookup My Bookings</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-champagne-100 text-espresso-900 font-bold flex items-center justify-center hover:bg-champagne-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="space-y-4 flex-1 overflow-y-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Mobile Number or Booking ID (e.g. SSA-8492)..." 
                className="w-full text-xs rounded-xl border border-champagne-300 py-2.5 pl-9 pr-3 bg-champagne-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500 font-mono" 
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-espresso-900 text-champagne-200 text-xs font-bold hover:bg-espresso-950 transition shadow"
            >
              {loading ? '...' : 'Search'}
            </button>
          </form>

          {/* Results List */}
          <div className="space-y-3 pt-1">
            {!searched ? (
              <p className="text-xs text-espresso-800/70 text-center py-8">
                Enter your 10-digit mobile number to view upcoming and past reservations.
              </p>
            ) : bookings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 text-center text-xs text-slate-500 border border-slate-200">
                No bookings found matching "{query}". Check the number or call +91 6203060789 for help.
              </div>
            ) : (
              bookings.map(b => (
                <div 
                  key={b.id}
                  className="p-4 rounded-2xl bg-champagne-50 border border-champagne-300 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-espresso-950 text-sm">
                      Booking ID: #{b.id} — {b.guestName}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      b.status === 'Pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      b.status === 'Completed' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="text-espresso-800">
                    📅 <strong>{b.date}</strong> at <strong>{b.time}</strong> • Specialist: <strong>{b.stylist}</strong>
                  </div>

                  <div className="text-espresso-800">
                    💆‍♀️ Treatments: {(b.services || []).join(', ')}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-champagne-200">
                    <span className="font-bold text-emerald-800">
                      Total: ₹{(b.total || 0).toLocaleString('en-IN')}
                    </span>

                    {b.status !== 'Cancelled' && (
                      <button 
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-rose-600 hover:underline text-[11px] font-semibold"
                      >
                        Cancel Slot
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-champagne-200 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-champagne-100 hover:bg-champagne-200 text-espresso-900 text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
