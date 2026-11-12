import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EnrichHeroBooking from './components/EnrichHeroBooking';
import ServicesSection from './components/ServicesSection';
import HygieneSection from './components/HygieneSection';
import AcademySection from './components/AcademySection';
import LookbookSection from './components/LookbookSection';
import ReviewsSection from './components/ReviewsSection';
import Footer from './components/Footer';
import BookingDrawer from './components/BookingDrawer';
import MyBookingsModal from './components/MyBookingsModal';
import FestiveWelcomeModal from './components/FestiveWelcomeModal';
import OfficialDiplomaModal from './components/OfficialDiplomaModal';
import LeaveReviewModal from './components/LeaveReviewModal';
import AuthModal from './components/AuthModal';
import UserProfileDrawer from './components/UserProfileDrawer';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { MessageCircle, ShoppingBag, Sparkles, CheckCircle2, ChevronUp } from 'lucide-react';
import './App.css';

export default function App() {
  // Dedicated Page Routing: 'home' | 'login' | 'signup' | 'admin'
  const getViewFromLocation = useCallback(() => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (hash === '#admin' || hash === '#/admin' || path === '/admin' || search.includes('admin=true')) return 'admin';
    if (hash === '#login' || hash === '#/login' || path === '/login') return 'login';
    if (hash === '#signup' || hash === '#/signup' || path === '/signup') return 'signup';
    return 'home';
  }, []);

  const [currentView, setCurrentView] = useState(getViewFromLocation);
  const [signupPrefillPhone, setSignupPrefillPhone] = useState('');

  // Customer Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('serene_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Salon Data State
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Cart & Booking State
  const [cart, setCart] = useState([]); // Array of service IDs
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modals
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isDiplomaOpen, setIsDiplomaOpen] = useState(false);
  const [selectedDiploma, setSelectedDiploma] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [welcomeOffer, setWelcomeOffer] = useState(null);

  // Global Toast
  const [toastMessage, setToastMessage] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Handle Scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to popstate and hashchange for browser Back/Forward buttons
  useEffect(() => {
    const handleNav = () => {
      setCurrentView(getViewFromLocation());
    };
    window.addEventListener('popstate', handleNav);
    window.addEventListener('hashchange', handleNav);
    return () => {
      window.removeEventListener('popstate', handleNav);
      window.removeEventListener('hashchange', handleNav);
    };
  }, [getViewFromLocation]);

  // Navigate helper
  const navigate = useCallback((targetView, params = {}) => {
    if (params.prefillPhone) {
      setSignupPrefillPhone(params.prefillPhone);
    }
    setCurrentView(targetView);
    const targetHash = targetView === 'home' ? '' : `#${targetView}`;
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetView === 'home' ? '/' : `/#${targetView}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch initial public data
  const fetchData = useCallback(async () => {
    try {
      const [resOffers, resServices, resCourses, resReviews] = await Promise.all([
        fetch('/api/offers').then(r => r.json()).catch(() => ({ offers: [] })),
        fetch('/api/services').then(r => r.json()).catch(() => ({ services: [] })),
        fetch('/api/courses').then(r => r.json()).catch(() => ({ courses: [] })),
        fetch('/api/reviews').then(r => r.json()).catch(() => ({ reviews: [] }))
      ]);

      if (resOffers.offers) setOffers(resOffers.offers);
      if (resServices.services) setServices(resServices.services);
      if (resCourses.courses) setCourses(resCourses.courses);
      if (resReviews.reviews) setReviews(resReviews.reviews);

      // Check for welcome popup offer
      const activeBanner = (resOffers.offers || []).find(o => o.isBanner && o.active) || (resOffers.offers || [])[0];
      if (activeBanner && !sessionStorage.getItem('serene_welcome_seen')) {
        setWelcomeOffer(activeBanner);
        const t = setTimeout(() => {
          setIsWelcomeModalOpen(true);
          sessionStorage.setItem('serene_welcome_seen', 'true');
        }, 1200);
        return () => clearTimeout(t);
      }
    } catch (err) {
      console.error('Failed to load salon catalog data', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Google "Book Now" deep links (?action=book, #book, etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasBookAction = params.get('action') === 'book' || window.location.hash === '#book' || params.get('utm_action') === 'book';
    if (hasBookAction) {
      setTimeout(() => {
        const target = document.getElementById('quickBookingSection') || document.getElementById('servicesSection');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          showToast('Welcome from Google! Choose your salon rituals or request your appointment below.');
        }
      }, 700);
    }
  }, [showToast]);

  // Cart operations
  const handleToggleService = (serviceId) => {
    setCart(prev => {
      const exists = prev.includes(serviceId);
      if (exists) {
        showToast('Service removed from booking');
        return prev.filter(id => id !== serviceId);
      } else {
        const item = services.find(s => s.id === serviceId);
        showToast(`Added "${item ? item.name : 'Service'}" to booking`);
        return [...prev, serviceId];
      }
    });
  };

  const handleRemoveFromCart = (serviceId) => {
    setCart(prev => prev.filter(id => id !== serviceId));
    showToast('Service removed from booking');
  };

  const handleQuickBook = (serviceId) => {
    if (serviceId && !cart.includes(serviceId)) {
      setCart(prev => [...prev, serviceId]);
    }
    setIsCartOpen(true);
  };

  const handleQuickAddLook = (serviceId) => {
    const exists = services.find(s => s.id === serviceId);
    const targetId = exists ? serviceId : (services[0] ? services[0].id : serviceId);
    if (!cart.includes(targetId)) {
      setCart(prev => [...prev, targetId]);
    }
    setIsCartOpen(true);
    showToast('Look added to booking reservation!');
  };

  const handleClaimWelcomeOffer = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Code ${code} copied! Select services to apply.`);
    setIsCartOpen(true);
  };

  const handleDiplomaView = (cert) => {
    setSelectedDiploma(cert);
    setIsDiplomaOpen(true);
  };

  const handleReviewSuccess = (newRev) => {
    setReviews(prev => [newRev, ...prev]);
    showToast('Thank you! Your verified review has been published.');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Welcome, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('serene_user');
    localStorage.removeItem('serene_token');
    setCurrentUser(null);
    setIsProfileDrawerOpen(false);
    showToast('You have been logged out.');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. DEDICATED ADMIN DASHBOARD VIEW
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-champagne-50 text-espresso-950 font-sans selection:bg-champagne-300 selection:text-espresso-950">
        <AdminDashboard 
          onExitAdmin={() => navigate('home')} 
          showToast={showToast} 
        />
        {toastMessage && (
          <aside className="fixed bottom-6 right-6 z-50 bg-espresso-950 text-champagne-100 px-5 py-3.5 rounded-2xl shadow-2xl border border-champagne-400 flex items-center gap-3 animate-slide-up text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-champagne-400 shrink-0" />
            <span>{toastMessage}</span>
          </aside>
        )}
      </div>
    );
  }

  // 2. DEDICATED LOGIN PAGE
  if (currentView === 'login') {
    return (
      <div className="selection:bg-champagne-300 selection:text-espresso-950">
        <LoginPage 
          onNavigate={navigate}
          onAuthSuccess={handleAuthSuccess}
          showToast={showToast}
        />
        {toastMessage && (
          <aside className="fixed bottom-6 right-6 z-50 bg-espresso-950 text-champagne-100 px-5 py-3.5 rounded-2xl shadow-2xl border border-champagne-400 flex items-center gap-3 animate-slide-up text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-champagne-400 shrink-0" />
            <span>{toastMessage}</span>
          </aside>
        )}
      </div>
    );
  }

  // 3. DEDICATED SIGNUP PAGE
  if (currentView === 'signup') {
    return (
      <div className="selection:bg-champagne-300 selection:text-espresso-950">
        <SignupPage 
          onNavigate={navigate}
          onAuthSuccess={handleAuthSuccess}
          showToast={showToast}
          initialPhone={signupPrefillPhone}
        />
        {toastMessage && (
          <aside className="fixed bottom-6 right-6 z-50 bg-espresso-950 text-champagne-100 px-5 py-3.5 rounded-2xl shadow-2xl border border-champagne-400 flex items-center gap-3 animate-slide-up text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-champagne-400 shrink-0" />
            <span>{toastMessage}</span>
          </aside>
        )}
      </div>
    );
  }

  // 4. MAIN CUSTOMER SANCTUARY HOME VIEW
  return (
    <div className="min-h-screen bg-champagne-50 text-espresso-950 font-sans selection:bg-champagne-300 selection:text-espresso-950 antialiased flex flex-col justify-between">
      <div>
        {/* Luxury Navigation Bar */}
        <Navbar 
          offers={offers}
          cartCount={cart.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenMyBookings={() => setIsMyBookingsOpen(true)}
          onToggleAdmin={() => navigate('admin')}
          isAdminView={false}
          currentUser={currentUser}
          onNavigate={navigate}
          onOpenProfile={() => setIsProfileDrawerOpen(true)}
        />

        {/* Hero Section */}
        <Hero 
          services={services}
          onQuickBook={handleQuickBook}
          onScrollTo={scrollToSection}
        />

        {/* Enrich-Style High-Conversion Split Booking Request Card */}
        <EnrichHeroBooking 
          onScrollToServices={() => scrollToSection('servicesSection')}
          showToast={showToast}
          onQuickSuccess={() => fetchData()}
        />

        {/* Enrich-Grade Image-Based Rate Card & Rituals Menu */}
        <ServicesSection 
          services={services}
          cart={cart}
          onToggleService={handleToggleService}
          onOpenCart={() => setIsCartOpen(true)}
        />

        {/* Clinical Sterilization Benchmark */}
        <HygieneSection />

        {/* Beauty Training Academy */}
        <AcademySection 
          courses={courses}
          onOpenDiplomaModal={handleDiplomaView}
          showToast={showToast}
        />

        {/* Social Media Transformations Lookbook */}
        <LookbookSection 
          onQuickAddLook={handleQuickAddLook}
        />

        {/* Verified 5.0 Star Client Reviews */}
        <ReviewsSection 
          reviews={reviews}
          onOpenLeaveReview={() => setIsReviewOpen(true)}
        />
      </div>

      {/* Footer */}
      <Footer 
        onToggleAdmin={() => navigate('admin')}
        onNavigate={navigate}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* WhatsApp Direct Chat */}
        <a 
          href="https://wa.me/916203060789?text=Hello%20Serene%20Salon%20%26%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20your%20services%20and%20academy%20courses."
          target="_blank" 
          rel="noopener noreferrer"
          className="w-13 h-13 p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group relative"
          title="Direct WhatsApp with Master Artist Rashmi Sah"
        >
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="absolute right-full mr-3 bg-espresso-950 text-white text-xs font-semibold px-2.5 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none shadow-md">
            Chat on WhatsApp
          </span>
        </a>

        {/* Scroll To Top Button */}
        {showScrollTop && (
          <button 
            type="button"
            onClick={scrollToTop}
            className="w-11 h-11 rounded-full bg-espresso-950/80 hover:bg-espresso-950 text-champagne-300 p-2.5 shadow-lg backdrop-blur-sm flex items-center justify-center transition hover:scale-105"
            title="Scroll to Top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Floating Sticky Mobile Booking Pill (When cart has items) */}
      {cart.length > 0 && (
        <aside className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-sm w-[90%] sm:w-auto">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-espresso-950 text-champagne-100 font-semibold text-sm shadow-2xl border-2 border-champagne-400 flex items-center justify-between sm:justify-center gap-4 hover:bg-black transition-all transform hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-champagne-500 text-espresso-950 text-xs font-bold flex items-center justify-center">
                {cart.length}
              </span>
              <span>Services Selected</span>
            </div>
            <span className="text-xs text-champagne-300 font-bold flex items-center gap-1">
              Proceed to Slot Booking & UPI →
            </span>
          </button>
        </aside>
      )}

      {/* Slide-over Multi-Service Booking Drawer */}
      <BookingDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        services={services}
        onRemoveFromCart={handleRemoveFromCart}
        onBookingSuccess={() => {
          setCart([]);
          fetchData();
        }}
        showToast={showToast}
        currentUser={currentUser}
      />

      {/* Customer Privilege Club & Appointments Profile Drawer */}
      <UserProfileDrawer 
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        showToast={showToast}
      />

      {/* My Bookings Lookup Modal */}
      <MyBookingsModal 
        isOpen={isMyBookingsOpen}
        onClose={() => setIsMyBookingsOpen(false)}
        showToast={showToast}
      />

      {/* Festive Welcome Promo Popup */}
      <FestiveWelcomeModal 
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        offer={welcomeOffer}
        onClaimAndBook={handleClaimWelcomeOffer}
        showToast={showToast}
      />

      {/* Verifiable Official Academy Diploma Modal */}
      <OfficialDiplomaModal 
        isOpen={isDiplomaOpen}
        onClose={() => {
          setIsDiplomaOpen(false);
          setSelectedDiploma(null);
        }}
        cert={selectedDiploma}
      />

      {/* Leave Verified Review Modal */}
      <LeaveReviewModal 
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onReviewSuccess={handleReviewSuccess}
        showToast={showToast}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <aside className="fixed bottom-6 right-6 z-50 bg-espresso-950 text-champagne-100 px-5 py-3.5 rounded-2xl shadow-2xl border border-champagne-400 flex items-center gap-3 animate-slide-up text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-champagne-400 shrink-0" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
