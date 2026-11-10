// ==========================================
// SERENE SALON & ACADEMY - ADMIN CONTROLLER
// ==========================================

let adminState = {
  isUnlocked: false,
  stats: {},
  offers: [],
  services: [],
  courses: [],
  bookings: [],
  inquiries: [],
  certificates: [],
  reviews: [],
  settings: {}
};

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById('adminToast');
  const toastMsg = document.getElementById('adminToastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  if (window._adminToastTimer) clearTimeout(window._adminToastTimer);
  window._adminToastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Modal helper functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Tab navigation
function switchTab(tabName) {
  document.querySelectorAll('.admin-tab-pane').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById('tab-' + tabName);
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.className = 'admin-tab-btn active px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition bg-champagne-600 text-espresso-950 shadow';
    } else {
      btn.className = 'admin-tab-btn px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition text-champagne-200 hover:bg-espresso-800';
    }
  });

  // Refresh data for the specific tab
  if (tabName === 'overview') fetchStats();
  if (tabName === 'offers') fetchOffers();
  if (tabName === 'services') fetchServices();
  if (tabName === 'courses') fetchCourses();
  if (tabName === 'bookings') fetchBookings();
  if (tabName === 'inquiries') fetchInquiries();
  if (tabName === 'certificates') fetchCertificates();
  if (tabName === 'reviews') fetchReviews();
  if (tabName === 'settings') fetchSettings();
}

// ==========================================
// 1. AUTHENTICATION & PIN
// ==========================================
function checkAuth() {
  const saved = sessionStorage.getItem('serene_admin_auth');
  if (saved === 'true') {
    adminState.isUnlocked = true;
    document.getElementById('authOverlay').classList.add('hidden');
    loadInitialData();
  } else {
    document.getElementById('authOverlay').classList.remove('hidden');
  }
}

async function verifyPin(e) {
  if (e) e.preventDefault();
  const pinInput = document.getElementById('adminPinInput');
  const errorMsg = document.getElementById('pinErrorMsg');
  const pin = pinInput.value.trim();

  try {
    const res = await fetch('/api/admin/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('serene_admin_auth', 'true');
      adminState.isUnlocked = true;
      document.getElementById('authOverlay').classList.add('hidden');
      errorMsg.classList.add('hidden');
      pinInput.value = '';
      loadInitialData();
      showToast('Welcome to Serene Salon & Academy Dashboard!');
    } else {
      errorMsg.classList.remove('hidden');
      pinInput.focus();
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = 'Server connection error. Please try again.';
    errorMsg.classList.remove('hidden');
  }
}

function lockPortal() {
  sessionStorage.removeItem('serene_admin_auth');
  adminState.isUnlocked = false;
  document.getElementById('authOverlay').classList.remove('hidden');
  showToast('Dashboard locked.');
}

// ==========================================
// 2. DATA LOADERS
// ==========================================
async function loadInitialData() {
  await Promise.all([
    fetchStats(),
    fetchOffers(),
    fetchServices(),
    fetchCourses(),
    fetchBookings(),
    fetchInquiries(),
    fetchCertificates(),
    fetchReviews(),
    fetchSettings()
  ]);
}

async function fetchStats() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    if (data.success) {
      adminState.stats = data.stats;
      renderStats();
    }
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

function renderStats() {
  const s = adminState.stats;
  document.getElementById('statTotalBookings').textContent = s.totalBookings || 0;
  document.getElementById('statTodayBookings').textContent = `${s.todayBookingsCount || 0} appointments today`;
  document.getElementById('statPendingBookings').textContent = s.pendingBookings || 0;
  document.getElementById('statNewInquiries').textContent = s.newInquiries || 0;
  document.getElementById('statTotalInquiries').textContent = `${s.totalInquiries || 0} total student inquiries`;
  document.getElementById('statTotalRevenue').textContent = `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`;
  document.getElementById('statActiveOffers').textContent = `${s.activeOffersCount || 0} active festive offers`;
}

// ==========================================
// 3. FESTIVE OFFERS & PROMOS
// ==========================================
async function fetchOffers() {
  try {
    const res = await fetch('/api/offers?all=true');
    const data = await res.json();
    if (data.success) {
      adminState.offers = data.offers;
      renderAdminOffers();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderAdminOffers() {
  const container = document.getElementById('offersListGrid');
  if (!container) return;

  if (adminState.offers.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
        No festive offers found. Click "+ Create New Offer" to start a seasonal campaign!
      </div>`;
    return;
  }

  container.innerHTML = adminState.offers.map(o => `
    <div class="bg-white rounded-2xl border ${o.active ? 'border-champagne-300 ring-1 ring-champagne-400/40' : 'border-slate-200 opacity-75'} p-5 shadow-sm hover:shadow transition flex flex-col justify-between space-y-4">
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${o.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}">
            ${o.active ? 'Active Campaign' : 'Paused / Inactive'}
          </span>
          ${o.isBanner ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-champagne-100 text-champagne-800 border border-champagne-300">Top Banner Alert</span>` : ''}
        </div>

        <div>
          <span class="text-[11px] font-bold text-champagne-700 uppercase tracking-wider">${o.highlightBadge || 'Special Offer'}</span>
          <h3 class="font-bold text-base text-slate-900 leading-snug mt-0.5">${o.title}</h3>
          <p class="text-xs text-slate-500 mt-1">${o.description || 'Applicable on bookings above minimum amount.'}</p>
        </div>

        <div class="p-3 bg-champagne-50/80 rounded-xl border border-champagne-200/80 flex items-center justify-between">
          <div>
            <div class="text-[10px] text-slate-500 uppercase font-semibold">Promo Code</div>
            <div class="font-mono text-base font-extrabold text-espresso-950">${o.code}</div>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-slate-500 uppercase font-semibold">Discount</div>
            <div class="text-base font-extrabold text-emerald-700">${o.discountPercent}% Off</div>
          </div>
        </div>

        <div class="text-[11px] text-slate-500 space-y-0.5">
          <div>💰 Min Booking: <strong>₹${(o.minBookingAmount || 0).toLocaleString('en-IN')}</strong></div>
          <div>📅 Valid Till: <strong>${o.validTill || 'Open Ended'}</strong></div>
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <button onclick="toggleOfferStatus('${o.id}', ${!o.active})" class="font-semibold ${o.active ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}">
          ${o.active ? 'Pause Offer' : 'Activate Offer'}
        </button>
        <div class="flex items-center gap-3">
          <button onclick="editOffer('${o.id}')" class="text-champagne-800 hover:underline font-semibold">Edit</button>
          <button onclick="deleteOffer('${o.id}')" class="text-rose-600 hover:underline font-semibold">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function handleOfferSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('offerEditId').value;
  const payload = {
    title: document.getElementById('offerTitleInput').value.trim(),
    code: document.getElementById('offerCodeInput').value.trim().toUpperCase(),
    discountPercent: Number(document.getElementById('offerDiscountInput').value),
    minBookingAmount: Number(document.getElementById('offerMinBookingInput').value) || 0,
    validTill: document.getElementById('offerValidTillInput').value,
    highlightBadge: document.getElementById('offerBadgeInput').value.trim(),
    description: document.getElementById('offerDescInput').value.trim(),
    isBanner: document.getElementById('offerIsBannerCheckbox').checked,
    active: document.getElementById('offerActiveCheckbox').checked
  };

  try {
    const url = id ? `/api/offers/${id}` : '/api/offers';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('offerModal');
      document.getElementById('offerForm').reset();
      document.getElementById('offerEditId').value = '';
      fetchOffers();
      fetchStats();
      showToast(id ? 'Offer updated successfully!' : 'Festive offer created successfully!');
    }
  } catch (err) {
    console.error(err);
    alert('Error saving offer.');
  }
}

function editOffer(id) {
  const o = adminState.offers.find(x => x.id === id);
  if (!o) return;
  document.getElementById('offerEditId').value = o.id;
  document.getElementById('offerModalTitle').textContent = 'Edit Festive Offer';
  document.getElementById('offerTitleInput').value = o.title;
  document.getElementById('offerCodeInput').value = o.code;
  document.getElementById('offerDiscountInput').value = o.discountPercent;
  document.getElementById('offerMinBookingInput').value = o.minBookingAmount || '';
  document.getElementById('offerValidTillInput').value = o.validTill || '';
  document.getElementById('offerBadgeInput').value = o.highlightBadge || '';
  document.getElementById('offerDescInput').value = o.description || '';
  document.getElementById('offerIsBannerCheckbox').checked = Boolean(o.isBanner);
  document.getElementById('offerActiveCheckbox').checked = Boolean(o.active);
  openModal('offerModal');
}

async function toggleOfferStatus(id, active) {
  try {
    const res = await fetch(`/api/offers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    });
    const data = await res.json();
    if (data.success) {
      fetchOffers();
      fetchStats();
      showToast(active ? 'Offer activated!' : 'Offer paused.');
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteOffer(id) {
  if (!confirm('Are you sure you want to delete this offer?')) return;
  try {
    const res = await fetch(`/api/offers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchOffers();
      fetchStats();
      showToast('Offer deleted.');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 4. SALON SERVICES & RATE CARD
// ==========================================
async function fetchServices() {
  try {
    const res = await fetch('/api/services?all=true');
    const data = await res.json();
    if (data.success) {
      adminState.services = data.services;
      renderAdminServices();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderAdminServices() {
  const table = document.getElementById('adminServicesTable');
  if (!table) return;

  const catFilter = document.getElementById('servicesFilterCategory')?.value || 'all';
  let filtered = adminState.services;
  if (catFilter !== 'all') {
    filtered = filtered.filter(s => s.category === catFilter);
  }

  if (filtered.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-slate-400">No services match the filter.</td></tr>`;
    return;
  }

  table.innerHTML = filtered.map(s => `
    <tr class="hover:bg-slate-50/70 transition">
      <td class="py-3 px-4 font-bold text-slate-900">${s.name}</td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-full bg-champagne-100 text-champagne-800 text-[11px] font-semibold">${s.category}</span></td>
      <td class="py-3 px-4 font-bold text-slate-900">₹${s.price.toLocaleString('en-IN')}</td>
      <td class="py-3 px-4">${s.duration} mins</td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">${s.badge || 'Standard'}</span></td>
      <td class="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500" title="${s.hygieneNote}">${s.hygieneNote || 'Autoclaved Tools'}</td>
      <td class="py-3 px-4">
        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}">
          ${s.active ? 'Active' : 'Hidden'}
        </span>
      </td>
      <td class="py-3 px-4 text-right space-x-2">
        <button onclick="editService('${s.id}')" class="text-champagne-700 hover:underline font-semibold">Edit</button>
        <button onclick="toggleServiceStatus('${s.id}', ${!s.active})" class="text-slate-600 hover:underline text-[11px]">${s.active ? 'Hide' : 'Show'}</button>
        <button onclick="deleteService('${s.id}')" class="text-rose-600 hover:underline font-semibold">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function handleServiceSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('serviceEditId').value;
  const payload = {
    name: document.getElementById('serviceNameInput').value.trim(),
    category: document.getElementById('serviceCategoryInput').value,
    price: Number(document.getElementById('servicePriceInput').value),
    duration: Number(document.getElementById('serviceDurationInput').value),
    badge: document.getElementById('serviceBadgeInput').value.trim(),
    hygieneNote: document.getElementById('serviceHygieneInput').value.trim(),
    description: document.getElementById('serviceDescInput').value.trim(),
    active: document.getElementById('serviceActiveCheckbox').checked
  };

  try {
    const url = id ? `/api/services/${id}` : '/api/services';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('serviceModal');
      document.getElementById('serviceForm').reset();
      document.getElementById('serviceEditId').value = '';
      fetchServices();
      showToast(id ? 'Service updated!' : 'Service created successfully!');
    }
  } catch (err) {
    console.error(err);
    alert('Error saving service.');
  }
}

function editService(id) {
  const s = adminState.services.find(x => x.id === id);
  if (!s) return;
  document.getElementById('serviceEditId').value = s.id;
  document.getElementById('serviceModalTitle').textContent = 'Edit Salon Service';
  document.getElementById('serviceNameInput').value = s.name;
  document.getElementById('serviceCategoryInput').value = s.category;
  document.getElementById('servicePriceInput').value = s.price;
  document.getElementById('serviceDurationInput').value = s.duration;
  document.getElementById('serviceBadgeInput').value = s.badge || '';
  document.getElementById('serviceHygieneInput').value = s.hygieneNote || '';
  document.getElementById('serviceDescInput').value = s.description || '';
  document.getElementById('serviceActiveCheckbox').checked = Boolean(s.active);
  openModal('serviceModal');
}

async function toggleServiceStatus(id, active) {
  try {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    });
    const data = await res.json();
    if (data.success) {
      fetchServices();
      showToast(active ? 'Service published to rate card!' : 'Service hidden from rate card.');
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;
  try {
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchServices();
      showToast('Service deleted.');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 5. ACADEMY COURSES
// ==========================================
async function fetchCourses() {
  try {
    const res = await fetch('/api/courses?all=true');
    const data = await res.json();
    if (data.success) {
      adminState.courses = data.courses;
      renderAdminCourses();
      populateCourseSelectInquiryAdmin();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderAdminCourses() {
  const container = document.getElementById('adminCoursesGrid');
  if (!container) return;

  if (adminState.courses.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
        No academy courses configured. Click "+ Add Course" to add diploma or fast-track programs.
      </div>`;
    return;
  }

  container.innerHTML = adminState.courses.map(c => `
    <div class="bg-white rounded-2xl border ${c.active ? 'border-champagne-300' : 'border-slate-200 opacity-75'} p-6 shadow-sm hover:shadow transition flex flex-col justify-between space-y-4">
      <div class="space-y-3">
        <div class="flex items-center justify-between gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.active ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-500'}">
            ${c.active ? 'Admissions Open' : 'Batch Paused'}
          </span>
          <span class="text-xs font-semibold text-slate-500">${c.duration}</span>
        </div>

        <h3 class="font-editorial text-2xl font-bold text-espresso-950">${c.title}</h3>
        <p class="text-xs text-slate-500 font-medium">🎯 Track: ${c.level} • 📅 ${c.nextBatch || 'Ongoing Batches'}</p>

        <div class="p-3.5 bg-champagne-50/80 rounded-xl border border-champagne-200/80 flex items-center justify-between">
          <div>
            <div class="text-[10px] text-slate-500 uppercase font-semibold">Standard Fee</div>
            <div class="text-sm font-semibold line-through text-slate-400">₹${(c.fee || 0).toLocaleString('en-IN')}</div>
          </div>
          <div class="text-right">
            <div class="text-[10px] text-emerald-800 uppercase font-bold">Early-Bird Scholarship</div>
            <div class="text-lg font-extrabold text-emerald-700">₹${(c.earlyBirdFee || c.fee || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div>
          <div class="text-[11px] font-bold text-slate-700 mb-1">Key Curriculum Highlights:</div>
          <ul class="space-y-1 text-xs text-slate-600">
            ${(c.highlights || []).map(h => `<li class="flex items-center gap-1.5"><span class="text-champagne-600 font-bold">✓</span> ${h}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <button onclick="toggleCourseStatus('${c.id}', ${!c.active})" class="font-semibold ${c.active ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}">
          ${c.active ? 'Pause Admissions' : 'Open Admissions'}
        </button>
        <div class="flex items-center gap-3">
          <button onclick="editCourse('${c.id}')" class="text-champagne-800 hover:underline font-semibold">Edit</button>
          <button onclick="deleteCourse('${c.id}')" class="text-rose-600 hover:underline font-semibold">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function handleCourseSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('courseEditId').value;
  const payload = {
    title: document.getElementById('courseTitleInput').value.trim(),
    duration: document.getElementById('courseDurationInput').value.trim(),
    level: document.getElementById('courseLevelInput').value.trim(),
    fee: Number(document.getElementById('courseFeeInput').value),
    earlyBirdFee: Number(document.getElementById('courseEarlyBirdInput').value) || Number(document.getElementById('courseFeeInput').value),
    nextBatch: document.getElementById('courseBatchInput').value.trim(),
    highlights: document.getElementById('courseHighlightsInput').value.split('\n').map(h => h.trim()).filter(Boolean),
    active: document.getElementById('courseActiveCheckbox').checked
  };

  try {
    const url = id ? `/api/courses/${id}` : '/api/courses';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('courseModal');
      document.getElementById('courseForm').reset();
      document.getElementById('courseEditId').value = '';
      fetchCourses();
      showToast(id ? 'Course updated!' : 'Course created successfully!');
    }
  } catch (err) {
    console.error(err);
    alert('Error saving course.');
  }
}

function editCourse(id) {
  const c = adminState.courses.find(x => x.id === id);
  if (!c) return;
  document.getElementById('courseEditId').value = c.id;
  document.getElementById('courseModalTitle').textContent = 'Edit Academy Course';
  document.getElementById('courseTitleInput').value = c.title;
  document.getElementById('courseDurationInput').value = c.duration;
  document.getElementById('courseLevelInput').value = c.level;
  document.getElementById('courseFeeInput').value = c.fee;
  document.getElementById('courseEarlyBirdInput').value = c.earlyBirdFee || '';
  document.getElementById('courseBatchInput').value = c.nextBatch || '';
  document.getElementById('courseHighlightsInput').value = (c.highlights || []).join('\n');
  document.getElementById('courseActiveCheckbox').checked = Boolean(c.active);
  openModal('courseModal');
}

async function toggleCourseStatus(id, active) {
  try {
    const res = await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active })
    });
    const data = await res.json();
    if (data.success) {
      fetchCourses();
      showToast(active ? 'Admissions opened!' : 'Admissions paused.');
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteCourse(id) {
  if (!confirm('Are you sure you want to delete this course?')) return;
  try {
    const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchCourses();
      showToast('Course removed.');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 6. BOOKINGS CRM
// ==========================================
async function fetchBookings() {
  try {
    const res = await fetch('/api/bookings');
    const data = await res.json();
    if (data.success) {
      adminState.bookings = data.bookings;
      renderAdminBookings();
      renderOverviewRecentBookings();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderOverviewRecentBookings() {
  const table = document.getElementById('overviewRecentBookingsTable');
  if (!table) return;

  const recents = adminState.bookings.slice(0, 5);
  if (recents.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">No appointments recorded yet.</td></tr>`;
    return;
  }

  table.innerHTML = recents.map(b => `
    <tr class="hover:bg-slate-50/70 transition">
      <td class="py-3 px-4 font-mono font-bold text-slate-800">#${b.id}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${b.guestName}</div>
        <div class="text-[11px] text-slate-500">${b.guestPhone}</div>
      </td>
      <td class="py-3 px-4">
        <div class="font-medium text-slate-800">${b.date}</div>
        <div class="text-[11px] text-slate-500">${b.time}</div>
      </td>
      <td class="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600">${(b.services || []).join(', ')}</td>
      <td class="py-3 px-4 font-bold text-emerald-800">₹${(b.total || 0).toLocaleString('en-IN')}</td>
      <td class="py-3 px-4">
        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(b.status)}">
          ${b.status}
        </span>
      </td>
      <td class="py-3 px-4 text-right">
        <button onclick="sendWhatsAppConfirmation('${b.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition">
          WhatsApp ↗
        </button>
      </td>
    </tr>
  `).join('');
}

function renderAdminBookings() {
  const table = document.getElementById('adminBookingsTable');
  if (!table) return;

  const searchVal = (document.getElementById('bookingsSearchInput')?.value || '').toLowerCase().trim();
  const statusVal = document.getElementById('bookingsFilterStatus')?.value || '';

  let list = adminState.bookings;
  if (statusVal) {
    list = list.filter(b => b.status === statusVal);
  }
  if (searchVal) {
    list = list.filter(b =>
      b.guestName.toLowerCase().includes(searchVal) ||
      b.guestPhone.toLowerCase().includes(searchVal) ||
      b.id.toLowerCase().includes(searchVal)
    );
  }

  if (list.length === 0) {
    table.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-slate-400">No bookings match your search filters.</td></tr>`;
    return;
  }

  table.innerHTML = list.map(b => `
    <tr class="hover:bg-slate-50/70 transition">
      <td class="py-3 px-4 font-mono font-bold text-slate-900">#${b.id}</td>
      <td class="py-3 px-4">
        <div class="font-bold text-slate-900">${b.guestName}</div>
        <div class="text-[11px] text-slate-500 font-mono">${b.guestPhone}</div>
      </td>
      <td class="py-3 px-4">
        <div class="font-semibold text-slate-800">${b.date}</div>
        <div class="text-[11px] text-slate-500">${b.time}</div>
      </td>
      <td class="py-3 px-4 text-[11px] text-slate-700">${b.stylist || 'Rashmi Sah'}</td>
      <td class="py-3 px-4 max-w-xs text-[11px] text-slate-600">
        <div>${(b.services || []).join(', ')}</div>
        ${b.notes ? `<div class="text-[10px] text-slate-400 italic mt-0.5">Note: ${b.notes}</div>` : ''}
      </td>
      <td class="py-3 px-4">
        <div class="font-bold text-emerald-800">₹${(b.total || 0).toLocaleString('en-IN')}</div>
        ${b.promoCode ? `<div class="text-[10px] text-slate-400 font-mono">Promo: ${b.promoCode}</div>` : ''}
      </td>
      <td class="py-3 px-4">
        <select onchange="updateBookingStatus('${b.id}', this.value)" class="text-[11px] rounded-lg border border-slate-300 py-1 px-2 font-semibold ${getStatusBadgeClass(b.status)}">
          <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td class="py-3 px-4 text-right space-x-1.5">
        <button onclick="viewBookingReceipt('${b.id}')" class="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px] hover:bg-slate-200 border border-slate-300 transition" title="Print/View Receipt">
          Receipt 📄
        </button>
        <button onclick="sendWhatsAppConfirmation('${b.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition">
          WhatsApp ↗
        </button>
        <button onclick="deleteBooking('${b.id}')" class="text-rose-600 hover:underline text-[11px] font-semibold">Delete</button>
      </td>
    </tr>
  `).join('');
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Confirmed': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Pending': return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Completed': return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Cancelled': return 'bg-rose-50 text-rose-800 border-rose-200';
    default: return 'bg-slate-100 text-slate-600';
  }
}

async function updateBookingStatus(id, status) {
  try {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      fetchBookings();
      fetchStats();
      showToast(`Booking #${id} marked as ${status}.`);
    }
  } catch (err) {
    console.error(err);
  }
}

function sendWhatsAppConfirmation(id) {
  const b = adminState.bookings.find(x => x.id === id);
  if (!b) return;

  const phone = (b.guestPhone || '').replace(/[^0-9]/g, '');
  const cleanPhone = phone.startsWith('91') ? phone : '91' + phone;

  const message = `Hello ${b.guestName}! 🌸\n\nGreetings from Serene Salon & Academy Vadodara!\n\nYour appointment booking #${b.id} is confirmed:\n📅 Date: ${b.date}\n⏰ Time: ${b.time}\n✨ Specialist: ${b.stylist}\n💆‍♀️ Services: ${(b.services || []).join(', ')}\n💳 Total Amount: ₹${(b.total || 0).toLocaleString('en-IN')}\n\nOur clinic uses 100% Autoclaved tools and fresh single-use kits. We look forward to pampering you!\n\nAddress: Opp. Shell Petrol Pump, Makarpura Industrial Estate, Vadodara.\nCall: +91 6203060789`;

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

async function deleteBooking(id) {
  if (!confirm(`Are you sure you want to delete Booking #${id}?`)) return;
  try {
    const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchBookings();
      fetchStats();
      showToast('Booking deleted.');
    }
  } catch (err) {
    console.error(err);
  }
}

// ------------------------------------------
// CALENDAR & RECEIPT HELPERS
// ------------------------------------------
function toggleBookingsView(view) {
  const tableContainer = document.getElementById('adminBookingsTableContainer');
  const calContainer = document.getElementById('adminCalendarContainer');
  const btnTable = document.getElementById('btnViewTable');
  const btnCal = document.getElementById('btnViewCalendar');

  if (view === 'calendar') {
    tableContainer.classList.add('hidden');
    calContainer.classList.remove('hidden');
    btnCal.className = 'px-3 py-1.5 rounded-lg font-bold transition bg-white shadow text-slate-900';
    btnTable.className = 'px-3 py-1.5 rounded-lg font-semibold transition text-slate-600 hover:text-slate-900';
    const dateInput = document.getElementById('calendarDateInput');
    if (!dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
    fetchCalendarSchedule();
  } else {
    calContainer.classList.add('hidden');
    tableContainer.classList.remove('hidden');
    btnTable.className = 'px-3 py-1.5 rounded-lg font-bold transition bg-white shadow text-slate-900';
    btnCal.className = 'px-3 py-1.5 rounded-lg font-semibold transition text-slate-600 hover:text-slate-900';
  }
}

async function fetchCalendarSchedule() {
  const dateInput = document.getElementById('calendarDateInput');
  const dateVal = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
  const container = document.getElementById('calendarTimelineGrid');
  if (!container) return;

  try {
    const res = await fetch(`/api/bookings/calendar?date=${dateVal}`);
    const data = await res.json();
    if (!data.success) return;

    const slots = ['10:30 AM', '11:30 AM', '12:30 PM', '02:00 PM', '03:30 PM', '04:30 PM', '06:00 PM', '07:00 PM'];
    const stylists = [
      'Rashmi Sah (Founder & Master Artist)',
      'Senior Skin & Laser Aesthetician',
      'Senior Hair & Balayage Expert',
      'Senior Nail & Lash Technician'
    ];

    container.innerHTML = `
      <div class="grid grid-cols-5 gap-2 text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
        <div class="p-2 bg-slate-100 rounded-lg">Time Slot</div>
        <div class="p-2 bg-champagne-100 text-espresso-950 rounded-lg">Rashmi Sah</div>
        <div class="p-2 bg-slate-100 rounded-lg">Skin Specialist</div>
        <div class="p-2 bg-slate-100 rounded-lg">Hair Balayage Expert</div>
        <div class="p-2 bg-slate-100 rounded-lg">Nail & Lash Tech</div>
      </div>
      ${slots.map(s => {
        return `
          <div class="grid grid-cols-5 gap-2 text-xs py-1.5 border-b border-slate-100 items-center">
            <div class="font-mono font-bold text-slate-800 p-2 bg-slate-50 rounded-lg">${s}</div>
            ${stylists.map(st => {
              const b = data.grid[s] && data.grid[s][st];
              if (b) {
                return `
                  <div class="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[11px] text-emerald-950 space-y-1 shadow-sm">
                    <div class="font-bold flex items-center justify-between">
                      <span>${b.guestName}</span>
                      <span class="text-[10px] px-1.5 py-0.2 rounded bg-emerald-200 font-mono">#${b.id}</span>
                    </div>
                    <div class="text-[10px] text-emerald-800 truncate">${(b.services || []).join(', ')}</div>
                    <div class="flex items-center gap-2 pt-0.5">
                      <button onclick="viewBookingReceipt('${b.id}')" class="text-[10px] text-emerald-900 underline font-semibold">Receipt</button>
                      <button onclick="sendWhatsAppConfirmation('${b.id}')" class="text-[10px] text-emerald-700 underline font-bold">WhatsApp</button>
                    </div>
                  </div>
                `;
              } else {
                return `
                  <div class="p-2.5 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-400 text-center text-[11px]">
                    Available Slot
                  </div>
                `;
              }
            }).join('')}
          </div>
        `;
      }).join('')}
    `;
  } catch (err) {
    console.error(err);
  }
}

function viewBookingReceipt(id) {
  const b = adminState.bookings.find(x => x.id === id);
  if (!b) return;

  document.getElementById('recBookingId').textContent = '#' + b.id;
  document.getElementById('recDate').textContent = b.date;
  document.getElementById('recTime').textContent = b.time;
  document.getElementById('recGuestName').textContent = b.guestName;
  document.getElementById('recPhone').textContent = b.guestPhone;
  document.getElementById('recStylist').textContent = b.stylist;
  document.getElementById('recSubtotal').textContent = `₹${(b.subtotal || b.total || 0).toLocaleString('en-IN')}`;
  document.getElementById('recTotal').textContent = `₹${(b.total || 0).toLocaleString('en-IN')}`;

  const discRow = document.getElementById('recDiscountRow');
  if (b.discount && b.discount > 0) {
    discRow.classList.remove('hidden');
    document.getElementById('recPromoCode').textContent = b.promoCode || 'PROMO';
    document.getElementById('recDiscount').textContent = `-₹${(b.discount).toLocaleString('en-IN')}`;
  } else {
    discRow.classList.add('hidden');
  }

  const list = document.getElementById('recServicesList');
  list.innerHTML = (b.services || []).map(s => `
    <div class="flex justify-between text-slate-800">
      <span>• ${s}</span>
      <span class="text-slate-500 font-medium">Included</span>
    </div>
  `).join('');

  openModal('receiptModal');
}

function printReceipt() {
  const printContent = document.getElementById('printableReceiptArea').innerHTML;
  const originalContent = document.body.innerHTML;
  const printWindow = window.open('', '_blank', 'width=650,height=750');
  printWindow.document.write(`
    <html>
      <head>
        <title>Receipt - Serene Salon & Academy</title>
        <style>
          body { font-family: sans-serif; padding: 25px; color: #1e293b; }
          .border { border: 1px solid #e2e8f0; }
          .p-6 { padding: 20px; }
          .rounded-2xl { border-radius: 12px; }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .flex { display: flex; justify-content: space-between; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .text-right { text-align: right; }
          .hidden { display: none; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        ${printContent}
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

function copyBroadcastText(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.select();
  document.execCommand('copy');
  showToast('Broadcast message copied to clipboard!');
}

function sendBroadcastWhatsApp(phoneInputId, textInputId) {
  const phoneEl = document.getElementById(phoneInputId);
  const textEl = document.getElementById(textInputId);
  if (!textEl) return;

  const phone = (phoneEl?.value || '').replace(/[^0-9]/g, '');
  const cleanPhone = phone ? (phone.startsWith('91') ? phone : '91' + phone) : '';
  const message = textEl.value;

  const url = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  window.open(url, '_blank');
}

// ==========================================
// 7. ACADEMY INQUIRIES & LEADS
// ==========================================
async function fetchInquiries() {
  try {
    const res = await fetch('/api/inquiries');
    const data = await res.json();
    if (data.success) {
      adminState.inquiries = data.inquiries;
      renderAdminInquiries();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderAdminInquiries() {
  const table = document.getElementById('adminInquiriesTable');
  if (!table) return;

  const statusFilter = document.getElementById('inquiriesFilterStatus')?.value || '';
  let list = adminState.inquiries;
  if (statusFilter) {
    list = list.filter(i => i.status === statusFilter);
  }

  if (list.length === 0) {
    table.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-400">No student counseling inquiries recorded.</td></tr>`;
    return;
  }

  table.innerHTML = list.map(i => {
    const phone = (i.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = phone.startsWith('91') ? phone : '91' + phone;
    const waText = `Hello ${i.name}! Greetings from Serene Beauty Academy Vadodara. We received your career inquiry for "${i.course}". Our Academy Director Rashmi Sah would love to invite you for a 1-on-1 counseling session and scholarship assessment. When are you free to chat?`;

    return `
      <tr class="hover:bg-slate-50/70 transition">
        <td class="py-3 px-4 font-mono font-bold text-slate-800">#${i.id}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900">${i.name}</div>
          <div class="text-[11px] text-slate-500 font-mono">${i.phone}</div>
        </td>
        <td class="py-3 px-4 font-semibold text-slate-800 max-w-xs">${i.course}</td>
        <td class="py-3 px-4 text-xs text-slate-600">
          <div>⏰ ${i.preferredTime || 'Flexible'}</div>
          ${i.notes ? `<div class="text-[11px] text-slate-400 italic mt-0.5">"${i.notes}"</div>` : ''}
        </td>
        <td class="py-3 px-4 text-[11px] text-slate-500">${i.createdAt ? new Date(i.createdAt).toLocaleDateString() : 'Recent'}</td>
        <td class="py-3 px-4">
          <select onchange="updateInquiryStatus('${i.id}', this.value)" class="text-[11px] rounded-lg border border-slate-300 py-1 px-2 font-semibold">
            <option value="New" ${i.status === 'New' ? 'selected' : ''}>New Lead</option>
            <option value="Contacted" ${i.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Enrolled" ${i.status === 'Enrolled' ? 'selected' : ''}>Enrolled Student 🎉</option>
            <option value="Closed" ${i.status === 'Closed' ? 'selected' : ''}>Closed / Inactive</option>
          </select>
        </td>
        <td class="py-3 px-4 text-right space-x-2">
          <a href="https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}" target="_blank" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-700 transition inline-block">
            Chat on WhatsApp ↗
          </a>
          <button onclick="deleteInquiry('${i.id}')" class="text-rose-600 hover:underline text-[11px] font-semibold">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function updateInquiryStatus(id, status) {
  try {
    const res = await fetch(`/api/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      fetchInquiries();
      fetchStats();
      showToast(`Inquiry #${id} marked as ${status}.`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteInquiry(id) {
  if (!confirm('Are you sure you want to delete this student inquiry?')) return;
  try {
    const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchInquiries();
      fetchStats();
      showToast('Inquiry deleted.');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 8. CERTIFICATES REGISTRY
// ==========================================
async function fetchCertificates() {
  try {
    const res = await fetch('/api/certificates');
    const data = await res.json();
    if (data.success) {
      adminState.certificates = data.certificates;
      renderAdminCertificates();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderAdminCertificates() {
  const table = document.getElementById('adminCertificatesTable');
  if (!table) return;

  if (adminState.certificates.length === 0) {
    table.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-slate-400">No certificates registered yet.</td></tr>`;
    return;
  }

  table.innerHTML = adminState.certificates.map(c => `
    <tr class="hover:bg-slate-50/70 transition">
      <td class="py-3 px-4 font-mono font-bold text-champagne-800">${c.id}</td>
      <td class="py-3 px-4 font-bold text-slate-900">${c.student}</td>
      <td class="py-3 px-4 text-xs text-slate-700">${c.course}</td>
      <td class="py-3 px-4"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">${c.grade}</span></td>
      <td class="py-3 px-4 text-[11px] text-slate-500">${c.issued}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="deleteCertificate('${c.id}')" class="text-rose-600 hover:underline text-[11px] font-semibold">Revoke / Delete</button>
      </td>
    </tr>
  `).join('');
}

async function handleCertSubmit(e) {
  e.preventDefault();
  const payload = {
    id: document.getElementById('certIdInput').value.trim().toUpperCase(),
    student: document.getElementById('certStudentInput').value.trim(),
    course: document.getElementById('certCourseInput').value.trim(),
    grade: document.getElementById('certGradeInput').value.trim(),
    issued: document.getElementById('certIssuedInput').value.trim()
  };

  try {
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('certModal');
      document.getElementById('certForm').reset();
      fetchCertificates();
      showToast(`Certificate #${payload.id} successfully issued!`);
    }
  } catch (err) {
    console.error(err);
    alert('Error issuing certificate.');
  }
}

async function deleteCertificate(id) {
  if (!confirm(`Are you sure you want to revoke/delete Certificate #${id}?`)) return;
  try {
    const res = await fetch(`/api/certificates/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchCertificates();
      showToast('Certificate removed.');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 9. REVIEWS & TESTIMONIALS
// ==========================================
async function fetchReviews() {
  try {
    const res = await fetch('/api/reviews?all=true');
    const data = await res.json();
    if (data.success) {
      adminState.reviews = data.reviews;
      renderAdminReviews();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderAdminReviews() {
  const container = document.getElementById('adminReviewsGrid');
  if (!container) return;

  if (adminState.reviews.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
        No reviews found. Click "+ Add Testimonial" to add customer reviews.
      </div>`;
    return;
  }

  container.innerHTML = adminState.reviews.map(r => `
    <div class="bg-white rounded-2xl border ${r.approved ? 'border-champagne-300' : 'border-slate-200 opacity-60'} p-5 shadow-sm flex flex-col justify-between space-y-3">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="text-amber-500 font-bold text-sm">${'★'.repeat(r.rating || 5)}</div>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${r.approved ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}">
            ${r.approved ? 'Approved & Visible' : 'Pending Review'}
          </span>
        </div>

        <p class="text-xs text-slate-700 italic">"${r.quote}"</p>

        <div class="flex flex-wrap gap-1 pt-1">
          ${(r.tags || []).map(t => `<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">${t}</span>`).join('')}
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <div class="font-bold text-slate-900">${r.reviewer}</div>
          <div class="text-[10px] text-slate-400">${r.source || 'Verified Client'}</div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="toggleReviewApproval('${r.id}', ${!r.approved})" class="text-champagne-700 hover:underline font-semibold">
            ${r.approved ? 'Hide' : 'Approve'}
          </button>
          <button onclick="deleteReview('${r.id}')" class="text-rose-600 hover:underline font-semibold">Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function handleReviewSubmit(e) {
  e.preventDefault();
  const payload = {
    reviewer: document.getElementById('reviewNameInput').value.trim(),
    rating: Number(document.getElementById('reviewRatingInput').value),
    source: document.getElementById('reviewSourceInput').value.trim(),
    tags: document.getElementById('reviewTagsInput').value.split(',').map(t => t.trim()).filter(Boolean),
    quote: document.getElementById('reviewQuoteInput').value.trim()
  };

  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('reviewModal');
      document.getElementById('reviewForm').reset();
      fetchReviews();
      showToast('Customer review added successfully!');
    }
  } catch (err) {
    console.error(err);
    alert('Error submitting review.');
  }
}

async function toggleReviewApproval(id, approved) {
  try {
    const res = await fetch(`/api/reviews/${id}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved })
    });
    const data = await res.json();
    if (data.success) {
      fetchReviews();
      showToast(approved ? 'Review approved on website.' : 'Review hidden from website.');
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteReview(id) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  try {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      fetchReviews();
      showToast('Review deleted.');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 10. SALON SETTINGS
// ==========================================
async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data.success) {
      adminState.settings = data.settings;
      populateSettingsForm();
    }
  } catch (err) {
    console.error(err);
  }
}

function populateSettingsForm() {
  const s = adminState.settings;
  if (!s) return;
  if (document.getElementById('settingSalonName')) document.getElementById('settingSalonName').value = s.salonName || '';
  if (document.getElementById('settingFounder')) document.getElementById('settingFounder').value = s.founder || '';
  if (document.getElementById('settingTagline')) document.getElementById('settingTagline').value = s.tagline || '';
  if (document.getElementById('settingPhone')) document.getElementById('settingPhone').value = s.phone || '';
  if (document.getElementById('settingWhatsapp')) document.getElementById('settingWhatsapp').value = s.whatsapp || '';
  if (document.getElementById('settingAddress')) document.getElementById('settingAddress').value = s.address || '';
  if (document.getElementById('settingTimings')) document.getElementById('settingTimings').value = s.timings || '';
  if (document.getElementById('settingUpiId')) document.getElementById('settingUpiId').value = s.upiId || '';
}

async function handleSettingsSubmit(e) {
  e.preventDefault();
  const payload = {
    salonName: document.getElementById('settingSalonName').value.trim(),
    founder: document.getElementById('settingFounder').value.trim(),
    tagline: document.getElementById('settingTagline').value.trim(),
    phone: document.getElementById('settingPhone').value.trim(),
    whatsapp: document.getElementById('settingWhatsapp').value.trim(),
    address: document.getElementById('settingAddress').value.trim(),
    timings: document.getElementById('settingTimings').value.trim(),
    upiId: document.getElementById('settingUpiId').value.trim()
  };

  const newPin = document.getElementById('settingAdminPin').value.trim();
  if (newPin) {
    payload.adminPin = newPin;
  }

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      adminState.settings = data.settings;
      document.getElementById('settingAdminPin').value = '';
      showToast('Salon settings saved successfully!');
    }
  } catch (err) {
    console.error(err);
    alert('Error saving settings.');
  }
}

function populateCourseSelectInquiryAdmin() {
  const sel = document.getElementById('manualInqCourse');
  if (!sel) return;
  sel.innerHTML = adminState.courses.map(c => `
    <option value="${c.title}">${c.title}</option>
  `).join('');
}

function openManualBookingModal() {
  const sel = document.getElementById('manualServiceSelect');
  if (sel) {
    sel.innerHTML = adminState.services.map(s => `
      <option value="${s.name}">${s.name} — ₹${s.price.toLocaleString('en-IN')} (${s.duration}m)</option>
    `).join('');
  }
  const dateInput = document.getElementById('manualDate');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  openModal('manualBookingModal');
}

async function handleManualBookingSubmit(e) {
  e.preventDefault();
  const guestName = document.getElementById('manualGuestName').value.trim();
  const guestPhone = document.getElementById('manualGuestPhone').value.trim();
  const service = document.getElementById('manualServiceSelect').value;
  const date = document.getElementById('manualDate').value;
  const time = document.getElementById('manualTime').value;
  const stylist = document.getElementById('manualStylist').value;
  const status = document.getElementById('manualStatus').value;
  const discount = Number(document.getElementById('manualDiscount').value) || 0;
  const promoCode = document.getElementById('manualPromo').value.trim();
  const notes = document.getElementById('manualNotes').value.trim();

  const foundService = adminState.services.find(s => s.name === service);
  const subtotal = foundService ? foundService.price : 1000;
  const total = Math.max(0, subtotal - discount);

  const payload = {
    guestName,
    guestPhone,
    date,
    time,
    stylist,
    services: [service],
    subtotal,
    discount,
    promoCode,
    total,
    status,
    notes
  };

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('manualBookingModal');
      document.getElementById('manualBookingForm').reset();
      fetchBookings();
      fetchStats();
      showToast(`Appointment #${data.booking.id} created!`);
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleManualInquirySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('manualInqName').value.trim();
  const phone = document.getElementById('manualInqPhone').value.trim();
  const course = document.getElementById('manualInqCourse').value;
  const preferredTime = document.getElementById('manualInqBatch').value;
  const status = document.getElementById('manualInqStatus').value;
  const notes = document.getElementById('manualInqNotes').value.trim();

  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, course, preferredTime, notes, status })
    });
    const data = await res.json();
    if (data.success) {
      closeModal('manualInquiryModal');
      document.getElementById('manualInquiryForm').reset();
      fetchInquiries();
      fetchStats();
      showToast('Student lead logged successfully!');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// DOM READY & LISTENERS
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  // Check session PIN
  checkAuth();

  // Tab buttons
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  // Forms
  document.getElementById('pinLoginForm')?.addEventListener('submit', verifyPin);
  document.getElementById('lockPortalBtn')?.addEventListener('click', lockPortal);
  document.getElementById('offerForm')?.addEventListener('submit', handleOfferSubmit);
  document.getElementById('serviceForm')?.addEventListener('submit', handleServiceSubmit);
  document.getElementById('courseForm')?.addEventListener('submit', handleCourseSubmit);
  document.getElementById('certForm')?.addEventListener('submit', handleCertSubmit);
  document.getElementById('reviewForm')?.addEventListener('submit', handleReviewSubmit);
  document.getElementById('settingsForm')?.addEventListener('submit', handleSettingsSubmit);
  document.getElementById('manualBookingForm')?.addEventListener('submit', handleManualBookingSubmit);
  document.getElementById('manualInquiryForm')?.addEventListener('submit', handleManualInquirySubmit);
});

