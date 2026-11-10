import React, { useState } from 'react';
import { Award, CheckCircle2, Clock, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function AcademySection({ courses, onOpenDiplomaModal, showToast }) {
  const [certInput, setCertInput] = useState('');
  const [certResult, setCertResult] = useState(null);
  const [certLoading, setCertLoading] = useState(false);

  // Inquiry Form State
  const [inqName, setInqName] = useState('');
  const [inqPhone, setInqPhone] = useState('');
  const [inqCourse, setInqCourse] = useState(courses[0] ? courses[0].title : '');
  const [inqTiming, setInqTiming] = useState('Morning Batch (10 AM - 1 PM)');
  const [inqNotes, setInqNotes] = useState('');
  const [inqSuccess, setInqSuccess] = useState(null);
  const [submittingInq, setSubmittingInq] = useState(false);

  // Certificate Verification
  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanId = certInput.trim().toUpperCase();
    if (!cleanId) {
      setCertResult({ error: 'Please enter a Certificate ID (e.g. SSA-2026-104)' });
      return;
    }

    setCertLoading(true);
    setCertResult(null);

    try {
      const res = await fetch(`/api/certificates/verify/${cleanId}`);
      const data = await res.json();
      if (data.success && data.certificate) {
        setCertResult({ cert: data.certificate });
      } else {
        setCertResult({ error: `No certificate record found for ID "${cleanId}". Try sample ID SSA-2026-104.` });
      }
    } catch (err) {
      setCertResult({ error: 'Error connecting to certificate registry.' });
    } finally {
      setCertLoading(false);
    }
  };

  // Inquiry Submission
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inqName || !inqPhone) {
      alert('Please enter your name and phone number.');
      return;
    }

    setSubmittingInq(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inqName,
          phone: inqPhone,
          course: inqCourse || (courses[0] ? courses[0].title : 'General Cosmetology Diploma'),
          preferredTime: inqTiming,
          notes: inqNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setInqSuccess(data.inquiry);
        setInqName('');
        setInqPhone('');
        setInqNotes('');
        showToast('Career counseling inquiry submitted!');
      } else {
        alert(data.message || 'Error submitting inquiry.');
      }
    } catch (err) {
      alert('Server connection error. Please call +91 6203060789 directly.');
    } finally {
      setSubmittingInq(false);
    }
  };

  const handleSelectCourse = (title) => {
    setInqCourse(title);
    const formEl = document.getElementById('academyInquiryForm');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
    showToast(`Selected "${title}" for career counseling.`);
  };

  return (
    <section id="academySection" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Visuals & Certificate Verification */}
        <div className="lg:col-span-5 space-y-6">
          <span className="text-xs font-bold uppercase tracking-wider text-champagne-700">Lakmé & CIDESCO Standard Vocational Training</span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-espresso-950">
            Serene Professional Beauty Academy
          </h2>
          <p className="text-xs sm:text-sm text-espresso-800/80 leading-relaxed">
            Gain mastery in bridal makeup, clinical cosmetology, advance hair coloring, and acrylic nail sculpting under the direct mentorship of <strong>Rashmi Sah</strong>.
          </p>

          <div className="relative rounded-3xl overflow-hidden shadow-xl border border-champagne-300 group">
            <img 
              src="/images/academy-masterclass.jpg" 
              alt="Serene Cosmetology Academy Live Masterclass Vadodara" 
              className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" 
            />
            <div className="absolute bottom-3 left-3 right-3 bg-espresso-950/85 backdrop-blur-md p-3.5 rounded-2xl text-white text-xs border border-champagne-400/30">
              <span className="font-bold text-champagne-300 block mb-0.5">Live Hands-on Client Model Training:</span>
              Every student practices on live models and completes 3 professional portfolio shoots.
            </div>
          </div>

          {/* Certificate Verification Card */}
          <div className="bg-champagne-100/70 border border-champagne-300 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-champagne-800" />
              <div>
                <h4 className="font-bold text-xs text-espresso-950 uppercase tracking-wider">Online Certificate Registry</h4>
                <p className="text-[11px] text-espresso-800/70">Verify graduate credentials & authenticity</p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="flex gap-2">
              <input 
                type="text" 
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                placeholder="Try ID: SSA-2026-104"
                className="flex-1 text-xs rounded-xl border border-champagne-300 py-2.5 px-3 uppercase font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-champagne-500 shadow-inner"
              />
              <button 
                type="submit"
                disabled={certLoading}
                className="px-4 py-2.5 rounded-xl bg-espresso-900 hover:bg-espresso-950 text-champagne-200 text-xs font-bold transition shadow"
              >
                {certLoading ? '...' : 'Verify'}
              </button>
            </form>

            {certResult && (
              <div className="pt-1">
                {certResult.cert ? (
                  <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-300 text-emerald-950 text-xs space-y-2 shadow-sm">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Verified Academy Graduate</span>
                    </div>
                    <div><strong>Student:</strong> {certResult.cert.student}</div>
                    <div><strong>Course:</strong> {certResult.cert.course}</div>
                    <div><strong>Standing:</strong> <span className="bg-emerald-200/80 px-2 py-0.5 rounded font-bold">{certResult.cert.grade}</span></div>
                    <div className="text-[11px] text-emerald-800">📜 {certResult.cert.issued}</div>
                    <div className="pt-1">
                      <button 
                        type="button" 
                        onClick={() => onOpenDiplomaModal(certResult.cert)}
                        className="px-3.5 py-1.5 rounded-xl bg-espresso-900 text-champagne-200 font-bold text-xs hover:bg-espresso-950 transition flex items-center gap-1.5 shadow"
                      >
                        <span>View & Print Official Diploma</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl border bg-amber-50 border-amber-300 text-amber-950 text-xs">
                    {certResult.error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Courses & Batch Inquiry */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-2xl font-bold text-espresso-950">Professional Diploma & Certification Programs</h3>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Early-Bird Scholarship Active</span>
            </span>
          </div>

          {/* Courses List */}
          <div className="space-y-4">
            {courses.map(c => (
              <div 
                key={c.id}
                className="p-6 rounded-3xl bg-white border border-champagne-200 shadow-sm hover:border-champagne-400 hover:shadow-md transition duration-300 space-y-3.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-champagne-100 text-champagne-800 text-[11px] font-semibold">
                    {c.level}
                  </span>
                  <span className="text-xs font-semibold text-espresso-800/80 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-champagne-700" />
                    <span>{c.duration}</span>
                  </span>
                </div>

                <h4 className="font-editorial text-2xl font-bold text-espresso-950">
                  {c.title}
                </h4>

                <div className="space-y-1 text-xs text-espresso-800/85">
                  {(c.highlights || []).map((h, idx) => (
                    <p key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{h}</span>
                    </p>
                  ))}
                </div>

                <div className="pt-3 border-t border-champagne-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs text-espresso-800/70 line-through">
                      ₹{(c.fee || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="font-bold text-emerald-800 text-sm ml-2">
                      ₹{(c.earlyBirdFee || c.fee || 0).toLocaleString('en-IN')} (Early-Bird Scholarship)
                    </span>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => handleSelectCourse(c.title)}
                    className="text-xs font-bold text-champagne-800 hover:text-champagne-950 underline underline-offset-4 flex items-center gap-1"
                  >
                    <span>Select for Inquiry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Career Counselling & Batch Booking Form */}
          <div id="academyInquiryForm" className="bg-white rounded-3xl border border-champagne-300 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="border-b border-champagne-200 pb-3">
              <h4 className="font-editorial text-2xl font-bold text-espresso-950">
                Request Free Career Counselling & Early-Bird Scholarship
              </h4>
              <p className="text-xs text-espresso-800/75 mt-0.5">
                Receive the complete curriculum syllabus, installment plans, and 1-on-1 counseling with Rashmi Sah.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-espresso-800 mb-1">Your Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    value={inqName}
                    onChange={(e) => setInqName(e.target.value)}
                    placeholder="e.g. Diya Patel" 
                    className="w-full text-xs rounded-xl border border-champagne-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-champagne-50/40" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-espresso-800 mb-1">Mobile / WhatsApp Number *</label>
                  <input 
                    type="tel" 
                    required 
                    value={inqPhone}
                    onChange={(e) => setInqPhone(e.target.value)}
                    placeholder="e.g. 9876543210" 
                    className="w-full text-xs rounded-xl border border-champagne-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-champagne-50/40 font-mono" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-espresso-800 mb-1">Course of Interest</label>
                  <select 
                    value={inqCourse}
                    onChange={(e) => setInqCourse(e.target.value)}
                    className="w-full text-xs rounded-xl border border-champagne-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-white"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.title}>
                        {c.title} (Early-Bird: ₹{(c.earlyBirdFee || c.fee || 0).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-espresso-800 mb-1">Preferred Batch Timing</label>
                  <select 
                    value={inqTiming}
                    onChange={(e) => setInqTiming(e.target.value)}
                    className="w-full text-xs rounded-xl border border-champagne-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-white"
                  >
                    <option value="Morning Batch (10 AM - 1 PM)">Morning Batch (10 AM - 1 PM)</option>
                    <option value="Afternoon Batch (2 PM - 5 PM)">Afternoon Batch (2 PM - 5 PM)</option>
                    <option value="Weekend Intensive">Weekend Intensive Track</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-800 mb-1">Career Goal / Questions</label>
                <input 
                  type="text" 
                  value={inqNotes}
                  onChange={(e) => setInqNotes(e.target.value)}
                  placeholder="e.g. Planning to start a salon in Manjalpur, inquire about installment options..." 
                  className="w-full text-xs rounded-xl border border-champagne-300 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-champagne-500 bg-champagne-50/40" 
                />
              </div>

              <button 
                type="submit" 
                disabled={submittingInq}
                className="w-full py-3.5 bg-espresso-900 hover:bg-espresso-950 text-champagne-200 rounded-xl font-bold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2"
              >
                <span>{submittingInq ? 'Submitting...' : 'Submit Inquiry for 20% Early-Bird Scholarship'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {inqSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-2 mt-3 shadow-sm">
                <div className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Inquiry Submitted Successfully! (Lead #{inqSuccess.id})</span>
                </div>
                <p>Our Academy Director Rashmi Sah will contact you for a personalized career counseling & scholarship assessment.</p>
                <div>
                  <a 
                    href={`https://wa.me/916203060789?text=${encodeURIComponent(
                      `Hello Rashmi Sah! I just submitted an inquiry for "${inqSuccess.course}" (${inqSuccess.preferredTime}) on the Serene Academy website. My name is ${inqSuccess.name} (${inqSuccess.phone}). Looking forward to course counseling & early-bird scholarship details.`
                    )}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-block hover:bg-emerald-700 transition shadow"
                  >
                    Connect Directly on WhatsApp (+91 6203060789) ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
