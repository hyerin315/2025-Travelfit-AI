'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const JOB_OPTIONS = [
  { value: 'marketer', label: 'Marketer' },
  { value: 'designer', label: 'Designer' },
  { value: 'pm', label: 'Product Manager' },
  { value: 'other', label: 'Others' },
];

export default function HomePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && jobTitle) {
      alert(`Thanks! We'll reach out soon.\nEmail: ${email}\nJob: ${jobTitle}`);
      setEmail('');
      setJobTitle('');
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inquiryEmail && inquiryMessage) {
      alert(`Message received!\nEmail: ${inquiryEmail}`);
      setIsModalOpen(false);
      setInquiryEmail('');
      setInquiryMessage('');
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #FFFCF5 0%, #F2F9FF 41%, #EEF3FD 62%, #FFEDF8 100%)',
      }}
    >
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 pt-28 pb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
            Ad Image Generator
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#19A8FF] via-[#2F83F7] to-[#3856EB]">
              for Travel Marketers
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mt-6">
            Create high-quality, on-brand travel visuals in just one minute—no complex setup required.
            Boost your campaign performance by up to 10× with AI-powered creative support.
          </p>
          <div className="pt-8">
            <button
              onClick={() => router.push('/generate')}
              className="inline-flex items-center justify-center gap-3 rounded-full px-10 py-4 text-base font-semibold text-white bg-gradient-to-r from-[#1FB4FF] via-[#2487FF] to-[#3556F6] shadow-[0_12px_30px_rgba(46,122,255,0.35)] hover:shadow-[0_16px_40px_rgba(46,122,255,0.45)] transition-all duration-300"
            >
              Get Started Without Login
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div
                key={idx}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`absolute inset-0 ${
                    idx % 4 === 0
                      ? 'bg-gradient-to-br from-amber-300 via-orange-300 to-red-400'
                      : idx % 4 === 1
                      ? 'bg-gradient-to-br from-blue-300 via-cyan-300 to-teal-400'
                      : idx % 4 === 2
                      ? 'bg-gradient-to-br from-purple-300 via-pink-300 to-rose-400'
                      : 'bg-gradient-to-br from-emerald-300 via-lime-300 to-yellow-300'
                  }`}
                />
                <div className="absolute inset-0 bg-white/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <p className="text-sm font-semibold drop-shadow">
                    {[
                      'Paris, France',
                      'Canola Fields, Jeju',
                      'Hanok Village, Seoul',
                      'Blue Trail, Alps',
                      'Brandenburg Gate',
                      'Taipei Night Market',
                      'Resort Pool, Phuket',
                      'Kyoto Gardens',
                      'NYC Skyline',
                      'Angkor Wat',
                      'Sunrise Yoga',
                      'Lisbon Dining',
                    ][idx]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-6">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 6a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Travel-Fit AI is about to get even smarter.
          </h2>
          <p className="text-gray-600 mt-4">
            Sign up to get early access to our beta launch and exclusive perks for marketers.
          </p>

          <form onSubmit={handleWaitlistSubmit} className="mt-10 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-5 py-4 text-base border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all"
              />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-5 py-4 text-left text-base border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-white flex items-center justify-between text-gray-700"
                >
                  <span>{jobTitle ? JOB_OPTIONS.find((job) => job.value === jobTitle)?.label : 'Job Role'}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      {JOB_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setJobTitle(option.value);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-5 py-3 text-left text-sm transition-colors ${
                            jobTitle === option.value ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white bg-[#176BFF] hover:bg-[#0E5BDE] transition-all shadow-lg"
            >
              Get Updates
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/60">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col items-center justify-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-white/80 backdrop-blur text-sm font-semibold text-gray-700 hover:bg-white transition-all"
          >
            Contact Us
          </button>
          <div className="text-sm text-gray-500">
            © 2025 Travel-Fit AI. All rights reserved. | Powered by Readdy
          </div>
        </div>
      </footer>

      {/* Business Inquiry Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Contact Us
            </h2>

            <form onSubmit={handleInquirySubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter your message
                </label>
                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  required
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all resize-none"
                  placeholder="Tell us how we can help you."
                />
                <div className="text-right text-sm text-gray-500 mt-2">
                  {inquiryMessage.length}/500
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
