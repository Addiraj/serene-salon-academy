import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Gift, Scissors, GraduationCap, Calendar, MessageSquare, 
  Award, Star, Settings, Download, Plus, Clock, CheckCircle, RefreshCw, 
  Trash2, Edit, Printer, Send, Copy, Lock, LogOut, ArrowRight, ShieldCheck 
} from 'lucide-react';

export default function AdminDashboard({ onExitAdmin, showToast }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('serene_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [stats, setStats] = useState({});
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState({});

  // View state for bookings
  const [bookingView, setBookingView] = useState('table'); // 'table' | 'calendar'
  const [calendarDate, setCalendarDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [calendarData, setCalendarData] = useState(null);

  // Modals inside Admin
  const [activeModal, setActiveModal] = useState(null); // 'offer' | 'service' | 'course' | 'cert' | 'manualBooking' | 'manualInquiry' | 'receipt'
  const [editingItem, setEditingItem] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);

  // PIN login
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinInput })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('serene_admin_auth', 'true');
        setPinError(false);
        showToast('Welcome to Serene Owner Dashboard!');
        loadAllData();
      } else {
        setPinError(true);
      }
    } catch (err) {
      setPinError(true);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('serene_admin_auth');
    setIsAuthenticated(false);
    showToast('Dashboard locked.');
  };

  const loadAllData = async () => {
    try {
      const [st, ofs, srv, crs, bks, inqs, certs, revs, sets] = await Promise.all([
        fetch('/api/admin/stats').then(r => r.json()),
        fetch('/api/offers?all=true').then(r => r.json()),
        fetch('/api/services?all=true').then(r => r.json()),
        fetch('/api/courses?all=true').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
        fetch('/api/inquiries').then(r => r.json()),
        fetch('/api/certificates').then(r => r.json()),
        fetch('/api/reviews?all=true').then(r => r.json()),
        fetch('/api/settings').then(r => r.json())
      ]);

      if (st.success) setStats(st.stats);
      if (ofs.success) setOffers(ofs.offers);
      if (srv.success) setServices(srv.services);
      if (crs.success) setCourses(crs.courses);
      if (bks.success) setBookings(bks.bookings);
      if (inqs.success) setInquiries(inqs.inquiries);
      if (certs.success) setCertificates(certs.certificates);
      if (revs.success) setReviews(revs.reviews);
      if (sets.success) setSettings(sets.settings);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  // Load calendar when view changes
  useEffect(() => {
    if (bookingView === 'calendar') {
      fetch(`/api/bookings/calendar?date=${calendarDate}`)
        .then(r => r.json())
        .then(d => {
          if (d.success) setCalendarData(d);
        });
    }
  }, [bookingView, calendarDate]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-espresso-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-champagne-300 text-center space-y-5">
          <div className="w-16 h-16 bg-champagne-100 rounded-2xl flex items-center justify-center mx-auto text-champagne-800 text-2xl font-bold shadow-inner">
            👑
          </div>
          <div>
            <h2 className="font-editorial text-3xl font-bold text-espresso-950">Serene Admin Access</h2>
            <p className="text-xs text-slate-500 mt-1">Please enter your Salon Owner PIN to manage bookings, festive campaigns, and student leads.</p>
          </div>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input 
                type="password" 
                maxLength={6}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (Default: 1234)" 
                className="w-full text-center text-2xl tracking-widest font-mono py-3 px-4 rounded-xl border border-champagne-300 focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-champagne-50/50" 
              />
              {pinError && (
                <p className="text-xs text-rose-600 mt-1 font-medium">Incorrect PIN. Default is 1234.</p>
              )}
            </div>
            <button 
              type="submit" 
              className="w-full py-3.5 bg-espresso-900 hover:bg-espresso-950 text-champagne-200 rounded-xl font-bold text-sm tracking-wide shadow-md transition"
            >
              Unlock Dashboard
            </button>
          </form>
          <div className="pt-2">
            <button onClick={onExitAdmin} className="text-xs text-slate-400 hover:underline">
              ← Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col">
      
      {/* Top Admin Navbar */}
      <header className="bg-espresso-950 text-white border-b border-champagne-800/60 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-champagne-600 flex items-center justify-center text-espresso-950 font-serif font-bold text-xl shadow">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-xl sm:text-2xl font-bold text-champagne-100 tracking-wide">Serene Salon & Academy</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-champagne-500/20 text-champagne-300 border border-champagne-500/40 uppercase tracking-wider">Owner Portal</span>
              </div>
              <p className="text-[11px] text-champagne-200/70 hidden sm:block">FF 16 Raama Emperro, Manjalpur, Vadodara • Managed by Rashmi Sah</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-lg bg-champagne-900/60 hover:bg-champagne-800/80 text-champagne-200 text-xs font-medium border border-champagne-700/50 flex items-center gap-1.5 transition"
            >
              <span>View Website</span>
              <span>↗</span>
            </button>
            <button 
              onClick={handleLock}
              className="px-3 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 text-red-200 text-xs font-medium border border-red-800/50 transition flex items-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>

        {/* Sub-Nav Tabs */}
        <div className="bg-espresso-900 border-t border-champagne-900/80 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-2 py-1.5">
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'offers', label: '🎁 Festive Campaigns' },
              { id: 'services', label: '💇‍♀️ Rate Card' },
              { id: 'courses', label: '🎓 Academy Courses' },
              { id: 'bookings', label: '📅 Bookings CRM' },
              { id: 'inquiries', label: '💬 Student Leads' },
              { id: 'certificates', label: '📜 Certificates' },
              { id: 'broadcast', label: '📢 WhatsApp Marketing' },
              { id: 'reviews', label: '⭐ Reviews' },
              { id: 'settings', label: '⚙️ Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-champagne-600 text-espresso-950 shadow font-bold'
                    : 'text-champagne-200 hover:bg-espresso-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* 1. TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-espresso-950 via-espresso-900 to-espresso-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-champagne-500/20 text-champagne-300 border border-champagne-500/30">
                      Salon Performance Hub
                    </span>
                    <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-champagne-100 mt-2">
                      Welcome, Rashmi Sah & Management
                    </h1>
                    <p className="text-xs sm:text-sm text-champagne-200/80 max-w-2xl">
                      Monitor client appointments, adjust seasonal Navratri & festive discounts in real time, and convert academy student admissions.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => { setEditingItem(null); setActiveModal('offer'); }}
                      className="px-4 py-2.5 rounded-xl bg-champagne-500 hover:bg-champagne-400 text-espresso-950 font-bold text-xs shadow transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Launch Festive Offer</span>
                    </button>
                    <a 
                      href="/api/admin/backup/db.json" 
                      download 
                      className="px-4 py-2.5 rounded-xl bg-champagne-900/80 hover:bg-champagne-800 text-champagne-200 font-bold text-xs border border-champagne-600/50 transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Backup Data</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric KPI Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Bookings</span>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-espresso-950">{stats.totalBookings || 0}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{stats.todayBookingsCount || 0} appointments today</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Pending Confirmation</span>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">{stats.pendingBookings || 0}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Awaiting WhatsApp slot confirmation</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Academy Leads</span>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{stats.newInquiries || 0}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{stats.totalInquiries || 0} total student inquiries</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Est. Booking Revenue</span>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">₹{(stats.totalRevenue || 0).toLocaleString('en-IN')}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{stats.activeOffersCount || 0} active festive offers</div>
                </div>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-slate-900">Recent Customer Appointments</h2>
                  <p className="text-xs text-slate-500">Latest online bookings from the public website</p>
                </div>
                <button onClick={() => setActiveTab('bookings')} className="text-xs font-semibold text-champagne-700 hover:underline">
                  View All Bookings →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Guest Name & Phone</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Treatments Booked</th>
                      <th className="py-3 px-4">Total (₹)</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">#{b.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{b.guestName}</div>
                          <div className="text-[11px] text-slate-500">{b.guestPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{b.date}</div>
                          <div className="text-[11px] text-slate-500">{b.time}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600">
                          {(b.services || []).join(', ')}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-800">₹{(b.total || 0).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                            b.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. TAB: FESTIVE OFFERS */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Festive Offers & Coupon Campaigns</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active campaigns automatically synchronize with the top announcement bar on the public website and calculate dynamic cart discounts.
                </p>
              </div>
              <button 
                onClick={() => { setEditingItem(null); setActiveModal('offer'); }}
                className="px-4 py-2.5 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Offer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {offers.map(o => (
                <div 
                  key={o.id}
                  className={`bg-white rounded-2xl border ${o.active ? 'border-champagne-300 ring-1 ring-champagne-400/40' : 'border-slate-200 opacity-75'} p-5 shadow-sm hover:shadow transition flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${o.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                        {o.active ? 'Active Campaign' : 'Paused'}
                      </span>
                      {o.isBanner && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-champagne-100 text-champagne-800 border border-champagne-300">
                          Top Banner Alert
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-champagne-700 uppercase tracking-wider">{o.highlightBadge || 'Special Offer'}</span>
                      <h3 className="font-bold text-base text-slate-900 leading-snug mt-0.5">{o.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{o.description}</p>
                    </div>

                    <div className="p-3 bg-champagne-50/80 rounded-xl border border-champagne-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Promo Code</div>
                        <div className="font-mono text-base font-extrabold text-espresso-950">{o.code}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Discount</div>
                        <div className="text-base font-extrabold text-emerald-700">{o.discountPercent}% Off</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>💰 Min Booking: <strong>₹{(o.minBookingAmount || 0).toLocaleString('en-IN')}</strong></div>
                      <div>📅 Valid Till: <strong>{o.validTill || 'Open Ended'}</strong></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <button 
                      onClick={async () => {
                        await fetch(`/api/offers/${o.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ active: !o.active })
                        });
                        loadAllData();
                        showToast(o.active ? 'Offer paused.' : 'Offer activated!');
                      }}
                      className={`font-semibold ${o.active ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}
                    >
                      {o.active ? 'Pause' : 'Activate'}
                    </button>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={async () => {
                          if (!confirm('Delete this festive offer?')) return;
                          await fetch(`/api/offers/${o.id}`, { method: 'DELETE' });
                          loadAllData();
                          showToast('Offer deleted.');
                        }}
                        className="text-rose-600 hover:underline font-semibold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. TAB: SERVICES */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Signature Salon Services & Rate Card</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage treatment pricing, duration, category filters, and clinical sterilization badges.</p>
              </div>
              <button 
                onClick={() => { setEditingItem(null); setActiveModal('service'); }}
                className="px-4 py-2 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Service Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Badge</th>
                      <th className="py-3 px-4">Hygiene Protocol</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-champagne-100 text-champagne-800 text-[11px] font-semibold">{s.category}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">₹{s.price.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">{s.duration} mins</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">{s.badge || 'Standard'}</span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500">{s.hygieneNote}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button 
                            onClick={async () => {
                              if (!confirm('Delete this service?')) return;
                              await fetch(`/api/services/${s.id}`, { method: 'DELETE' });
                              loadAllData();
                              showToast('Service deleted.');
                            }}
                            className="text-rose-600 hover:underline font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB: COURSES */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Serene Professional Beauty Academy Courses</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage diploma & certified courses, batch dates, fees, and early-bird scholarship discounts.</p>
              </div>
              <button 
                onClick={() => { setEditingItem(null); setActiveModal('course'); }}
                className="px-4 py-2.5 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Course</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {courses.map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-champagne-300 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {c.level}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">⏱ {c.duration}</span>
                  </div>

                  <h3 className="font-editorial text-2xl font-bold text-espresso-950">{c.title}</h3>

                  <div className="p-3.5 bg-champagne-50/80 rounded-xl border border-champagne-200/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Standard Fee</div>
                      <div className="text-sm font-semibold line-through text-slate-400">₹{(c.fee || 0).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-800 uppercase font-bold">Early-Bird Scholarship</div>
                      <div className="text-lg font-extrabold text-emerald-700">₹{(c.earlyBirdFee || c.fee || 0).toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    {(c.highlights || []).map((h, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-champagne-600 font-bold">✓</span> {h}
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button 
                      onClick={async () => {
                        if (!confirm('Delete this course?')) return;
                        await fetch(`/api/courses/${c.id}`, { method: 'DELETE' });
                        loadAllData();
                        showToast('Course removed.');
                      }}
                      className="text-rose-600 hover:underline font-semibold text-xs"
                    >
                      Delete Course
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. TAB: BOOKINGS CRM */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Appointment Bookings CRM</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Track, confirm, complete, or contact salon clients directly via WhatsApp.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setActiveModal('manualBooking')}
                    className="px-3.5 py-2 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Walk-in / Phone Slot</span>
                  </button>

                  <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                    <button 
                      onClick={() => setBookingView('table')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${bookingView === 'table' ? 'bg-white shadow text-slate-900' : 'text-slate-600'}`}
                    >
                      📋 Table View
                    </button>
                    <button 
                      onClick={() => setBookingView('calendar')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition ${bookingView === 'calendar' ? 'bg-white shadow text-slate-900 font-bold' : 'text-slate-600'}`}
                    >
                      📆 Day Timeline
                    </button>
                  </div>

                  <a 
                    href="/api/admin/export/bookings.csv" 
                    download 
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Table View */}
            {bookingView === 'table' ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Booking ID</th>
                        <th className="py-3 px-4">Guest & Contact</th>
                        <th className="py-3 px-4">Date & Slot</th>
                        <th className="py-3 px-4">Specialist</th>
                        <th className="py-3 px-4">Services</th>
                        <th className="py-3 px-4">Bill (₹)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">#{b.id}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{b.guestName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{b.guestPhone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{b.date}</div>
                            <div className="text-[11px] text-slate-500">{b.time}</div>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-700">{b.stylist}</td>
                          <td className="py-3 px-4 max-w-xs text-[11px] text-slate-600">
                            {(b.services || []).join(', ')}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-800">
                            ₹{(b.total || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <select 
                              value={b.status}
                              onChange={async (e) => {
                                await fetch(`/api/bookings/${b.id}/status`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: e.target.value })
                                });
                                loadAllData();
                                showToast(`Booking #${b.id} marked as ${e.target.value}.`);
                              }}
                              className="text-[11px] rounded-lg border border-slate-300 py-1 px-2 font-semibold"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Pending">Pending</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button 
                              onClick={() => {
                                setReceiptBooking(b);
                                setActiveModal('receipt');
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] hover:bg-slate-200 border border-slate-300 transition"
                            >
                              Receipt 📄
                            </button>
                            <a 
                              href={`https://wa.me/${(b.guestPhone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `Hello ${b.guestName}! 🌸 Greetings from Serene Salon & Academy Vadodara! Your booking #${b.id} is confirmed: 📅 Date: ${b.date} at ${b.time} with ${b.stylist}. Services: ${(b.services || []).join(', ')}. Total: ₹${b.total}. Autoclaved sterile station reserved!`
                              )}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition inline-block"
                            >
                              WhatsApp ↗
                            </a>
                            <button 
                              onClick={async () => {
                                if (!confirm(`Delete Booking #${b.id}?`)) return;
                                await fetch(`/api/bookings/${b.id}`, { method: 'DELETE' });
                                loadAllData();
                                showToast('Booking deleted.');
                              }}
                              className="text-rose-600 hover:underline text-[11px] font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Calendar View */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Day Schedule & Specialist Station Allocation</h3>
                    <p className="text-xs text-slate-500">Visual timeline to prevent double-booking and track live sterilizations.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-slate-700">Select Date:</label>
                    <input 
                      type="date" 
                      value={calendarDate}
                      onChange={(e) => setCalendarDate(e.target.value)}
                      className="text-xs rounded-xl border border-slate-300 py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500 font-semibold" 
                    />
                  </div>
                </div>

                {calendarData && (
                  <div className="overflow-x-auto min-w-[700px]">
                    <div className="grid grid-cols-5 gap-2 text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
                      <div className="p-2 bg-slate-100 rounded-lg">Time Slot</div>
                      <div className="p-2 bg-champagne-100 text-espresso-950 rounded-lg">Rashmi Sah</div>
                      <div className="p-2 bg-slate-100 rounded-lg">Skin Specialist</div>
                      <div className="p-2 bg-slate-100 rounded-lg">Hair Balayage Expert</div>
                      <div className="p-2 bg-slate-100 rounded-lg">Nail & Lash Tech</div>
                    </div>
                    {['10:30 AM', '11:30 AM', '12:30 PM', '02:00 PM', '03:30 PM', '04:30 PM', '06:00 PM', '07:00 PM'].map(slot => (
                      <div key={slot} className="grid grid-cols-5 gap-2 text-xs py-2 border-b border-slate-100 items-center">
                        <div className="font-mono font-bold text-slate-800 p-2 bg-slate-50 rounded-lg">{slot}</div>
                        {[
                          'Rashmi Sah (Founder & Master Artist)',
                          'Senior Skin & Laser Aesthetician',
                          'Senior Hair & Balayage Expert',
                          'Senior Nail & Lash Technician'
                        ].map(st => {
                          const match = calendarData.grid[slot] && calendarData.grid[slot][st];
                          return (
                            <div key={st}>
                              {match ? (
                                <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[11px] text-emerald-950 space-y-1 shadow-sm">
                                  <div className="font-bold flex items-center justify-between">
                                    <span>{match.guestName}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200 font-mono">#{match.id}</span>
                                  </div>
                                  <div className="text-[10px] text-emerald-800 truncate">{(match.services || []).join(', ')}</div>
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-center text-[11px]">
                                  Available
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 6. TAB: INQUIRIES */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Academy Career Counselling Inquiries & Leads</h2>
                <p className="text-xs text-slate-500 mt-0.5">Prospective students who requested course guidance, fee breakdowns, or scholarship details.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveModal('manualInquiry')}
                  className="px-3.5 py-2 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 font-bold text-xs shadow transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Student Lead</span>
                </button>
                <a 
                  href="/api/admin/export/inquiries.csv" 
                  download 
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Leads CSV</span>
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Inquiry ID</th>
                      <th className="py-3 px-4">Student Name & Phone</th>
                      <th className="py-3 px-4">Course of Interest</th>
                      <th className="py-3 px-4">Preferred Timing</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">WhatsApp Lead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.map(i => (
                      <tr key={i.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">#{i.id}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{i.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{i.phone}</div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs">{i.course}</td>
                        <td className="py-3 px-4 text-xs text-slate-600">{i.preferredTime}</td>
                        <td className="py-3 px-4">
                          <select 
                            value={i.status}
                            onChange={async (e) => {
                              await fetch(`/api/inquiries/${i.id}/status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: e.target.value })
                              });
                              loadAllData();
                              showToast(`Lead #${i.id} marked as ${e.target.value}.`);
                            }}
                            className="text-[11px] rounded-lg border border-slate-300 py-1 px-2 font-semibold"
                          >
                            <option value="New">New Lead</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Enrolled">Enrolled 🎉</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <a 
                            href={`https://wa.me/${(i.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${i.name}! Greetings from Serene Beauty Academy Vadodara. We received your career inquiry for "${i.course}". Our Academy Director Rashmi Sah would love to invite you for a 1-on-1 counseling session and scholarship assessment.`
                            )}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition inline-block"
                          >
                            WhatsApp ↗
                          </a>
                          <button 
                            onClick={async () => {
                              if (!confirm('Delete this inquiry?')) return;
                              await fetch(`/api/inquiries/${i.id}`, { method: 'DELETE' });
                              loadAllData();
                              showToast('Inquiry deleted.');
                            }}
                            className="text-rose-600 hover:underline text-[11px] font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. TAB: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Academy Certificate Verification Registry</h2>
                <p className="text-xs text-slate-500 mt-0.5">Certificates registered here can be instantly verified by students, salons, and employers on the public website.</p>
              </div>
              <button 
                onClick={() => setActiveModal('cert')}
                className="px-4 py-2.5 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 font-bold text-xs shadow transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New Certificate</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Certificate ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Graduation Course</th>
                      <th className="py-3 px-4">Grade / Standing</th>
                      <th className="py-3 px-4">Issuance Details</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {certificates.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-champagne-800">{c.id}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{c.student}</td>
                        <td className="py-3 px-4 text-xs text-slate-700">{c.course}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">{c.grade}</span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500">{c.issued}</td>
                        <td className="py-3 px-4 text-right">
                          <button 
                            onClick={async () => {
                              if (!confirm(`Revoke Certificate #${c.id}?`)) return;
                              await fetch(`/api/certificates/${c.id}`, { method: 'DELETE' });
                              loadAllData();
                              showToast('Certificate removed.');
                            }}
                            className="text-rose-600 hover:underline text-[11px] font-semibold"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. TAB: WHATSAPP MARKETING BROADCASTS */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <h2 className="text-lg font-bold text-slate-900">WhatsApp Marketing & Festive Broadcast Suite</h2>
              <p className="text-xs text-slate-500">
                High-converting promotional messages ready to send to prospective brides, festive clients, and cosmetology students in Vadodara.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[
                {
                  badge: 'Festive Campaign',
                  title: '🌸 Navratri Dandiya Glamour (Flat 20% Off)',
                  text: `🌸 Hey beautiful! Ready to dazzle this Navratri? ✨\n\nSerene Salon & Academy brings you our exclusive Festive Glow Makeover with Flat 20% Off!\n💃 Waterproof HD Makeup + Hairdo + Chaniya Choli Draping\n💆‍♀️ Pre-Garba Hydra-Glow Medi-Facial\n💅 Acrylic Extensions & Glitter Art\n\nBook using coupon code *SERENE20* at:\nhttps://serenesalonacademy.com\n\nAutoclave sterilized tools & clinical hygiene guaranteed!\n📍 FF 16, Raama Emperro, Near Shell Petrol Pump, Manjalpur, Vadodara.\nCall: +91 6203060789`
                },
                {
                  badge: 'Wedding Season',
                  title: '👰 Royal Bridal HD & Airbrush by Rashmi Sah',
                  text: `👑 Congratulations on your upcoming wedding! 💍\n\nTurn your dream bridal look into reality with Master Educator Rashmi Sah at Serene Salon & Academy Vadodara.\n✨ Complete Royal HD & Airbrush Base\n✨ Floral Hairstyling, Lenses & Luxury Lashes\n✨ Saree & Lehenga Draping with Jewellery Pinning\n✨ Complimentary Skin Prep Consultation\n\nEnjoy 15% Early-Bird discount with code *BRIDAL15*!\nReserve your wedding dates early before slots fill up:\nCall/WhatsApp: +91 6203060789\nLocation: FF 16 Raama Emperro, Manjalpur, Vadodara`
                },
                {
                  badge: 'Hair Therapy',
                  title: '💆‍♀️ Insta Care Hair Spa & Keratin Revival',
                  text: `✨ Give your locks the luxury revival they deserve! 🌿\n\nPost-festive styling, dust, and heat can damage your hair. Restore intense gloss & strength with Serene Salon's signature:\n💆‍♀️ Insta Care Hair Spa (Up to Below-Waist Length)\n🌿 Keratin Bond-Repair Deep Masque\n💆‍♀️ Cranial Acupressure Relaxation\n💇‍♀️ Designer Haircut & Salon Blowdry\n\nRated 5.0 ★ across 1,551+ reviews on Justdial!\nSpecial package price starts at just ₹1,450.\nBook your slot today: +91 6203060789`
                },
                {
                  badge: 'Student Outreach',
                  title: '🎓 Serene Cosmetology Academy Admissions Open',
                  text: `🎓 Start Your Journey into the ₹50,000 Cr Beauty Industry! 💄\n\nAdmissions are now open for the upcoming batch at Serene Professional Beauty Academy Vadodara!\n🏆 Complete Pro Cosmetology & Salon Management (16 Weeks)\n💄 Master Bridal HD & Editorial Makeup (6 Weeks)\n💅 Acrylic Nail Extension & 3D Art Pro (3 Weeks)\n\n✓ 100% Practical Training on Live Models\n✓ Direct Mentorship by Rashmi Sah\n✓ Government & Lakmé standard syllabus\n✓ 20% Early-Bird Scholarship for this batch!\n\nBook your free career counseling session today:\nCall/WhatsApp: +91 6203060789`
                }
              ].map((camp, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-champagne-300 p-5 shadow-sm space-y-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-champagne-100 text-champagne-800 uppercase tracking-wider">
                    {camp.badge}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{camp.title}</h3>
                  <textarea 
                    rows={5}
                    defaultValue={camp.text}
                    id={`bcast_${idx}`}
                    className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
                  />
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button 
                      onClick={() => {
                        const el = document.getElementById(`bcast_${idx}`);
                        if (el) {
                          el.select();
                          document.execCommand('copy');
                          showToast('Broadcast text copied to clipboard!');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                    <a 
                      href={`https://wa.me/?text=${encodeURIComponent(camp.text)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send WhatsApp ↗</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. TAB: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Client Reviews & Testimonials</h2>
                <p className="text-xs text-slate-500 mt-0.5">Verified 5.0 ★ feedback from Justdial and direct salon guests.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-champagne-300 p-5 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-amber-500 font-bold text-sm">{'★'.repeat(r.rating || 5)}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.approved ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                        {r.approved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 italic">"{r.quote}"</p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{r.reviewer}</div>
                      <div className="text-[10px] text-slate-400">{r.source}</div>
                    </div>
                    <button 
                      onClick={async () => {
                        await fetch(`/api/reviews/${r.id}/approve`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ approved: !r.approved })
                        });
                        loadAllData();
                        showToast(r.approved ? 'Review hidden.' : 'Review approved!');
                      }}
                      className="text-champagne-700 hover:underline font-semibold"
                    >
                      {r.approved ? 'Hide' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. TAB: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Salon & Business Profile Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">Update contact numbers, address, WhatsApp triggers, and change your Admin PIN.</p>
            </div>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                await fetch('/api/settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(settings)
                });
                showToast('Salon settings saved successfully!');
              }} 
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Salon Name</label>
                  <input 
                    type="text" 
                    value={settings.salonName || ''}
                    onChange={(e) => setSettings({ ...settings, salonName: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Founder / Master Educator</label>
                  <input 
                    type="text" 
                    value={settings.founder || ''}
                    onChange={(e) => setSettings({ ...settings, founder: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Address</label>
                <input 
                  type="text" 
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Phone</label>
                  <input 
                    type="text" 
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">UPI ID for Online Payments</label>
                  <input 
                    type="text" 
                    value={settings.upiId || ''}
                    onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                    className="w-full text-xs rounded-xl border border-slate-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500" 
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 font-bold text-xs shadow transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Printable Receipt Modal */}
      {activeModal === 'receipt' && receiptBooking && (
        <div className="fixed inset-0 z-50 bg-espresso-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-champagne-300 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-editorial text-2xl font-bold text-espresso-950">Appointment Receipt</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div id="reactPrintableReceipt" className="p-6 rounded-2xl bg-champagne-50/50 border border-champagne-300 space-y-4 text-xs text-slate-800">
              <div className="text-center border-b border-champagne-200 pb-3 space-y-1">
                <div className="w-10 h-10 rounded-full bg-espresso-950 text-champagne-300 font-serif font-bold text-lg flex items-center justify-center mx-auto">
                  S
                </div>
                <h4 className="font-editorial text-xl font-bold text-espresso-950">Serene Salon & Academy</h4>
                <p className="text-[11px] text-slate-500">FF 16 Raama Emperro, Manjalpur, Vadodara • +91 6203060789</p>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold mt-1">
                  ✓ 100% Autoclaved Sterile Station Assigned
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><strong>Booking ID:</strong> <span className="font-mono font-bold text-espresso-950">#{receiptBooking.id}</span></div>
                <div className="text-right"><strong>Date:</strong> <span>{receiptBooking.date}</span></div>
                <div><strong>Guest:</strong> <span className="font-bold">{receiptBooking.guestName}</span></div>
                <div className="text-right"><strong>Time Slot:</strong> <span>{receiptBooking.time}</span></div>
                <div><strong>Contact:</strong> <span className="font-mono">{receiptBooking.guestPhone}</span></div>
                <div className="text-right"><strong>Specialist:</strong> <span>{receiptBooking.stylist}</span></div>
              </div>

              <div className="border-t border-b border-champagne-200 py-2 space-y-1.5">
                <div className="font-bold text-[11px] uppercase tracking-wider text-slate-500">Treatments Reserved</div>
                {(receiptBooking.services || []).map((s, idx) => (
                  <div key={idx} className="flex justify-between text-slate-800">
                    <span>• {s}</span>
                    <span className="text-slate-500">Included</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-sm font-bold text-espresso-950 pt-1">
                  <span>Total Bill:</span>
                  <span className="text-base text-emerald-800">₹{(receiptBooking.total || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[10px] text-slate-400 text-center pt-2 italic">
                  Thank you for visiting Serene Salon & Academy Vadodara!
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Close</button>
              <button 
                onClick={() => {
                  const printContent = document.getElementById('reactPrintableReceipt').innerHTML;
                  const win = window.open('', '_blank', 'width=650,height=750');
                  win.document.write(`<html><head><title>Receipt #${receiptBooking.id}</title><style>body{font-family:sans-serif;padding:20px;color:#181210;}.text-center{text-align:center;}.flex{display:flex;justify-content:space-between;}.grid{display:grid;grid-template-columns:1fr 1fr;}</style></head><body>${printContent}<script>window.onload=function(){window.print();window.close();};</script></body></html>`);
                  win.document.close();
                }}
                className="px-5 py-2 rounded-xl bg-espresso-900 text-champagne-200 text-xs font-bold hover:bg-espresso-950 transition flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
