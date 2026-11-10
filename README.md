# Serene Salon & Academy — Full-Stack Booking Platform & Dynamic Admin Dashboard

A luxury salon and cosmetology training academy web application for **Serene Salon & Academy** (Vadodara, Gujarat), featuring a high-performance customer booking experience, instant UPI QR payments, verifiable digital graduation diplomas, and an all-in-one salon management and WhatsApp marketing admin dashboard.

---

## 🌟 Quick Start

The server is currently running and can be started anytime using:

```bash
npm start
```
Or with auto-restart on changes:
```bash
npm run dev
```

### Access URLs
- 🌐 **Customer Booking Website:** [http://localhost:3000](http://localhost:3000)
- 🔑 **Dedicated Customer Sign In Page:** [http://localhost:3000/login](http://localhost:3000/login) *(or `/#login`)*
- ✨ **Dedicated Customer Sign Up Page:** [http://localhost:3000/signup](http://localhost:3000/signup) *(or `/#signup`)*
- 👑 **Dynamic Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin) *(PIN: `1234`)*

---

## 🚀 Key Features Built

### 1. Dynamic Admin Dashboard (`/admin`)
- **PIN Protection:** Secure session-based salon owner access (PIN: `1234`).
- **Real-Time Analytics & KPI Feed:** Live appointment count, pending bookings, active festive campaigns, student inquiries pipeline, and estimated revenue.
- **Festive Offers & Coupon Manager:**
  - Launch, edit, pause, and delete seasonal promotional campaigns (e.g. Navratri, Diwali, New Year, Bridal combos).
  - Configure coupon codes (e.g. `SERENE20`), discount percentages, minimum booking amounts, and valid-till dates.
  - Option to broadcast active festive banners across the top of the public website and display the festive welcome discount popup!
- **Signature Services & Rate Card Manager:**
  - Add, edit, or toggle salon treatments across categories (*Skin & Facials*, *Hair Care & Spa*, *Nail Artistry*, *Bridal & Festive*, *Waxing & Threading*).
  - Set pricing, duration, badges ("Most Booked", "Vadodara Specialty", etc.), and hospital-grade clinical sterilization notes.
- **Academy Courses & Scholarships Manager:**
  - Add/edit diploma and fast-track cosmetology programs.
  - Set standard fees, early-bird scholarship discounts, batch dates, and curriculum highlights.
- **Appointments Bookings CRM:**
  - **Dual View:** Switch seamlessly between **📋 Table View** and **📆 Day Timeline Calendar**.
  - **Day Timeline Calendar:** Visual schedule matrix showing booked vs available slots across all 4 specialists (*Rashmi Sah*, *Skin Aesthetician*, *Hair Balayage Expert*, *Nail Technician*).
  - **+ Walk-in / Phone Slot Booking:** Directly create appointments for walk-in or phone-calling clients.
  - **Printable Digital Invoices & Receipts:** Generate a luxury printable client receipt with sterilization guarantee stamp and itemized bill.
  - **One-Click WhatsApp Confirmation:** Pre-fills a tailored confirmation message directly to the guest's mobile phone.
  - **CSV Export:** Download all bookings to Excel/CSV (`/api/admin/export/bookings.csv`).
- **Academy Leads & Student Inquiry CRM:**
  - Tracks incoming career counseling and scholarship requests.
  - **+ Add Student Lead:** Directly log walk-in student prospects.
  - Lead statuses (`New`, `Contacted`, `Enrolled`, `Closed`) with instant one-click WhatsApp chat link.
  - **CSV Export:** Download all student leads (`/api/admin/export/inquiries.csv`).
- **📢 WhatsApp Marketing & Broadcast Suite:**
  - Pre-crafted, high-converting festive broadcast campaigns ready to blast to prospective brides, festive clients, and students:
    1. *Navratri Dandiya Glamour (Flat 20% Off)*
    2. *Royal Bridal & Pre-Wedding HD Makeovers by Rashmi Sah*
    3. *Insta Care Hair Spa & Keratin Revival*
    4. *Academy Cosmetology Diploma Early-Bird Admissions*
- **Graduation Certificate Registry:**
  - Issue official verifiable graduation credentials that students and employers can verify on the public website.
- **Testimonial & Review Moderation:**
  - Review, approve, hide, or add 5.0 ★ verified reviews.
- **Business Profile Settings & Full Database Backup:**
  - Update phone numbers, WhatsApp links, address, salon timings, UPI payment IDs, change Admin PIN, and download a complete database backup (`db.json`).

---

### 2. Enrich-Inspired Luxury Customer Website (`/`)
- **Enrich-Style Split Hero Booking Widget:**
  - High-impact visual banner: *"YOUR FIRST VISIT, YOUR WAY! From medical-grade facials to complete makeovers. Women's Privileges From ₹549 | Academy Diplomas From ₹4,999"*.
  - 2-Step quick appointment request form (*Your name*, *+91 Mobile number*, segment toggle *Women's Salon* vs *Beauty Academy*, bot verification, and high-contrast *Request a booking* CTA).
  - Live social proof footer: *5.0 ★ (1,551+ reviews) • 100% Autoclave Sterilized • 12,000+ Happy Guests*.
- **Mobile OTP-Based Customer Authentication & Privilege Club:**
  - Passwordless, mobile-number-first login & registration modal.
  - Interactive 4-digit OTP verification with auto-focus, paste support, resend countdown, and on-screen test OTP code helper for instant testing.
  - New client signup with 150 welcome loyalty bonus points.
  - **Serene Privilege Profile Drawer:** Customer tier status (*Silver / Gold / Diamond*), points balance (*₹1 off per point*), past and upcoming appointments history, and one-click checkout auto-fill.
- **Interactive Google reCAPTCHA & Bot Shield:**
  - Embedded human verification widget protecting appointment requests, OTP dispatch, and reviews from automated spam bots.
  - Backed by backend verification token API (`/api/auth/verify-captcha`).
- **Enrich-Grade Image-Based Rate Card Catalog:**
  - Every service upgraded with high-resolution photographic cards (Hydra Medi-Facials, Designer Hair Cuts, Balayage Color, Insta Care Hair Spa, Permanent Acrylic Nails, Royal Gujarati Bridal HD, and Painless Cartridge Waxing).
  - Hover zoom effects, duration tags, autoclave hygiene guarantee notes, and starting prices in Indian Rupees.
- **Fast Page Load (<65 KB HTML):** Replaced heavy embedded Base64 strings with optimized image assets.
- **Festive Privilege Welcome Modal:** Greets visitors with the active festive discount code (e.g. `SERENE20`) with 1-click code copying and quick-reserve.
- **Dynamic Festive Announcement Bar:** Automatically syncs with active offers from the admin dashboard.
- **Multi-Service Booking Drawer:**
  - Dynamic cart management with treatment durations and subtotal.
  - Real-time coupon validation (`POST /api/offers/validate`) with instant discount calculation.
  - Loyalty points redemption: toggle to redeem privilege points directly for cash discounts.
  - Specialist stylist selection, calendar date, time slot, and guest details.
  - Auto-generated booking ID (`SSA-XXXX`) and direct salon WhatsApp slot reservation.
  - **📲 Instant UPI QR Code Payments:** Generates dynamic scan-and-pay QR codes for Google Pay, PhonePe, Paytm, and BHIM UPI directly in the drawer.
- **Career Counseling & Scholarship Form:** Direct student inquiry capture connected to the Admin CRM.
- **Live Certificate Verification & Printable Diploma:** Instantly checks certificate IDs against the registry (sample ID `SSA-2026-104`) and displays an official printable graduation diploma with gold crest, signatures, and honors grade.
- **Client Self-Service "My Bookings" Lookup:** Guests can check their appointment status anytime using their mobile number.
- **Client Review Submission:** Guests can leave direct feedback.
- **Floating WhatsApp & Quick Book Action:** Mobile-friendly quick access pill.

---

## 📁 Project Architecture

```
d:\Booking_website\
├── data/
│   └── db.json               # Persistent JSON database with atomic I/O
├── client/                   # Modern React (Vite + Tailwind + Lucide) Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Luxury sticky nav with dynamic festive banner
│   │   │   ├── Hero.jsx              # Editorial sanctuary header & quick booking widget
│   │   │   ├── ServicesSection.jsx   # Live Rate Card with categories & instant search
│   │   │   ├── HygieneSection.jsx    # Medical-grade autoclave sterilization showcase
│   │   │   ├── AcademySection.jsx    # CIDESCO/Lakmé syllabus & verifiable credential registry
│   │   │   ├── LookbookSection.jsx   # Instagram reels & client transformations lookbook
│   │   │   ├── ReviewsSection.jsx    # Verified 5.0 ★ Justdial client testimonials
│   │   │   ├── Footer.jsx            # Salon contact, hours, maps, and admin quick link
│   │   │   ├── BookingDrawer.jsx     # Slide-over cart, coupon validator & UPI QR payments
│   │   │   ├── MyBookingsModal.jsx   # Self-service booking lookup by phone number
│   │   │   ├── FestiveWelcomeModal.jsx# Welcome promo popup with 1-click code copying
│   │   │   ├── OfficialDiplomaModal.jsx# Official printable academy graduation diploma
│   │   │   ├── LeaveReviewModal.jsx  # Customer verified testimonial submission
│   │   │   ├── AdminDashboard.jsx    # All-in-one dynamic salon management portal
│   │   │   └── SocialIcons.jsx       # SVG brand icons for Instagram and Facebook
│   │   ├── App.jsx                   # Central state orchestrator
│   │   ├── App.css                   # Keyframe animations & luxury styling
│   │   ├── index.css                 # Brand typography & glassmorphism utilities
│   │   └── main.jsx                  # React application entry point
│   ├── dist/                         # Production build served directly by Express
│   ├── vite.config.js                # Vite configuration with Express API reverse proxy
│   └── package.json                  # React frontend dependencies (React 19, Lucide, Tailwind)
├── data/
│   └── db.json                       # Persistent JSON database with atomic I/O
├── public/                           # Standalone static portal & fallback
│   ├── admin/
│   │   └── index.html                # Classic standalone admin dashboard
│   ├── images/                       # High-res visual assets
│   │   ├── hero-sanctuary.jpg
│   │   ├── academy-masterclass.jpg
│   │   ├── lookbook-bridal.jpg
│   │   ├── lookbook-nails.jpg
│   │   └── lookbook-hair.jpg
│   ├── js/
│   │   ├── admin.js                  # Standalone admin logic
│   │   └── app.js                    # Standalone client logic
│   └── index.html                    # Standalone customer booking portal
├── package.json                      # Root configuration & npm scripts
└── server.js                         # Node.js Express REST API server & static host
```

---

## 💻 Modern Tech Stack

- **Frontend:** React, JavaScript (ES6+), Vite, Tailwind CSS 3.4, Lucide React icons, Cormorant Garamond & Inter Google Fonts.
- **Backend:** Node.js, Express.js REST API with CORS and JSON body parser.
- **Persistence:** Atomic JSON database (`data/db.json`) ensuring zero data corruption during concurrent writes.
- **Integrations:** Direct WhatsApp Click-to-Chat API, Dynamic UPI QR Code generator (`upi://pay` compatible with Google Pay, PhonePe, Paytm, BHIM), and CSV data exports.
