import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Award, Calendar, Clock, Sparkles, LogOut, FileText, CheckCircle2 } from 'lucide-react';

export default function UserProfileDrawer({ isOpen, onClose, user, onLogout, showToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchMyBookings = async () => {
      setLoading(true);
      try {
        const cleanPhone = (user.phone || '').replace(/\D/g, '').slice(-10);
        const res = await fetch(`/api/bookings/my?query=${encodeURIComponent(cleanPhone)}`);
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-left">
        
        {/* Drawer Header */}
        <div className="bg-espresso-950 text-white p-6 relative border-b border-champagne-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-champagne-200 transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-champagne-500/20 border-2 border-champagne-400 p-0.5 overflow-hidden">
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                alt={user.name} 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-champagne-500/20 text-champagne-300 text-[10px] font-bold border border-champagne-400/30">
                <Sparkles className="w-3 h-3 text-champagne-400" />
                <span>{user.tier || 'Serene Gold Privilege'}</span>
              </div>
              <h3 className="font-editorial text-2xl font-bold text-champagne-100 mt-1">
                {user.name}
              </h3>
              <p className="text-xs text-champagne-200/80 font-mono">
                {user.phone}
              </p>
            </div>
          </div>

          {/* Loyalty Balance Card */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-champagne-900/60 to-champagne-800/40 border border-champagne-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-champagne-300">
                Privilege Points Balance
              </div>
              <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                <span>{user.loyaltyPoints || 150}</span>
                <span className="text-xs font-normal text-champagne-300">pts (₹{user.loyaltyPoints || 150} value)</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-champagne-500 text-espresso-950 text-[11px] font-bold shadow">
              Redeem at Checkout
            </span>
          </div>
        </div>

        {/* Drawer Body: My Appointments */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between border-b border-champagne-200 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-espresso-950 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-champagne-600" />
              <span>My Appointments ({bookings.length})</span>
            </h4>
            <span className="text-[11px] text-espresso-800/70">
              Auto-Synced
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-espresso-800/60">
              Loading your appointments...
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Calendar className="w-8 h-8 text-champagne-400 mx-auto" />
              <p className="text-xs text-espresso-800/70">No active bookings found for your number.</p>
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-champagne-800 underline"
              >
                Browse Treatments & Book
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div 
                  key={b.id} 
                  className="p-4 rounded-2xl bg-champagne-50/60 border border-champagne-200 space-y-2 hover:border-champagne-400 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-espresso-900 bg-white px-2 py-0.5 rounded border border-champagne-300">
                      {b.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      b.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <div className="text-xs font-medium text-espresso-950">
                    {(b.services || []).join(', ')}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-espresso-800/80 pt-1 border-t border-champagne-200/60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-champagne-600" />
                      <span>{b.date} • {b.time}</span>
                    </div>
                    <span className="font-bold text-espresso-900">₹{(b.total || 0).toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px]">
                    <a
                      href={`https://wa.me/916203060789?text=Hello%20Serene%20Salon!%20Regarding%20my%20booking%20${b.id}%20for%20${b.date}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold underline"
                    >
                      WhatsApp Salon ↗
                    </a>
                    <span className="text-[10px] text-espresso-800/60">
                      Stylist: {b.stylist ? b.stylist.split('(')[0] : 'Master Artist'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-champagne-200 bg-champagne-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>

          <span className="text-[10px] text-espresso-800/50 font-mono">
            Serene Privilege ID: {user.id}
          </span>
        </div>

      </div>
    </div>
  );
}

