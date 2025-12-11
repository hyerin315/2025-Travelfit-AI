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
        <div className="max-w-6xl mx-auto px-6 pt-40 pb-16 text-center">
          <h1 className="text-h1 text-gray-900">
            Ad Image Generator
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-cta">
              for Travel Marketers
            </span>
          </h1>
          <p className="text-body-xl text-gray-800 max-w-[810px] mx-auto mt-5">
            Create high-quality, on-brand travel visuals in just one minute—no complex setup required.
            <br />
            Supercharge your ad performance by up to 10x.
          </p>
          <div className="pt-[50px]">
            <button
              onClick={() => router.push('/generate')}
              className="inline-flex items-center justify-center gap-3 rounded-full px-10 py-4 text-h5 text-gray-100 bg-gradient-cta shadow-[0_12px_30px_rgba(46,122,255,0.35)] hover:shadow-[0_16px_40px_rgba(46,122,255,0.45)] transition-all duration-300"
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
      <section className="py-12 overflow-hidden">
        <div className="relative">
          {/* 첫 번째 행 - 왼쪽으로 흐름 */}
          <div className="flex gap-6 mb-6 animate-scroll-left">
            {[
              { id: 1, title: 'Paris, France', seed: 'paris-eiffel', aspect: 'aspect-[420/240]', width: 'w-[420px]', imgSize: '420/240' },
              { id: 2, title: 'Canola Fields, Jeju', seed: 'jeju-canola', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 3, title: 'Hanok Village, Seoul', seed: 'seoul-hanok', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 4, title: 'Blue Trail, Alps', seed: 'alps-hiking', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 1, title: 'Paris, France', seed: 'paris-eiffel', aspect: 'aspect-[420/240]', width: 'w-[420px]', imgSize: '420/240' },
              { id: 2, title: 'Canola Fields, Jeju', seed: 'jeju-canola', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 3, title: 'Hanok Village, Seoul', seed: 'seoul-hanok', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 4, title: 'Blue Trail, Alps', seed: 'alps-hiking', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
            ].map((item, idx) => (
              <div
                key={`row1-${idx}`}
                className={`group relative ${item.aspect} ${item.width} flex-shrink-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300`}
              >
                <img
                  src={`https://picsum.photos/seed/${item.seed}/${item.imgSize}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-semibold text-white drop-shadow">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 두 번째 행 - 오른쪽으로 흐름 */}
          <div className="flex gap-6 mb-6 animate-scroll-right">
            {[
              { id: 5, title: 'Brandenburg Gate', seed: 'berlin-gate', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 6, title: 'Taipei Night Market', seed: 'taipei-night', aspect: 'aspect-[420/240]', width: 'w-[420px]', imgSize: '420/240' },
              { id: 7, title: 'Resort Pool, Phuket', seed: 'phuket-resort', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 8, title: 'Kyoto Gardens', seed: 'kyoto-temple', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 9, title: 'NYC Skyline', seed: 'nyc-skyline', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 5, title: 'Brandenburg Gate', seed: 'berlin-gate', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 6, title: 'Taipei Night Market', seed: 'taipei-night', aspect: 'aspect-[420/240]', width: 'w-[420px]', imgSize: '420/240' },
              { id: 7, title: 'Resort Pool, Phuket', seed: 'phuket-resort', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 8, title: 'Kyoto Gardens', seed: 'kyoto-temple', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 9, title: 'NYC Skyline', seed: 'nyc-skyline', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
            ].map((item, idx) => (
              <div
                key={`row2-${idx}`}
                className={`group relative ${item.aspect} ${item.width} flex-shrink-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300`}
              >
                <img
                  src={`https://picsum.photos/seed/${item.seed}/${item.imgSize}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-semibold text-white drop-shadow">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 세 번째 행 - 왼쪽으로 흐름 */}
          <div className="flex gap-6 animate-scroll-left">
            {[
              { id: 10, title: 'Angkor Wat', seed: 'angkor-wat', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 11, title: 'Sunrise Yoga', seed: 'yoga-sunrise', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 12, title: 'Lisbon Dining', seed: 'lisbon-dining', aspect: 'aspect-[420/240]', width: 'w-[420px]', imgSize: '420/240' },
              { id: 10, title: 'Angkor Wat', seed: 'angkor-wat', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 11, title: 'Sunrise Yoga', seed: 'yoga-sunrise', aspect: 'aspect-[320/240]', width: 'w-[320px]', imgSize: '320/240' },
              { id: 12, title: 'Lisbon Dining', seed: 'lisbon-dining', aspect: 'aspect-[420/240]', width: 'w-[420px]', imgSize: '420/240' },
            ].map((item, idx) => (
              <div
                key={`row3-${idx}`}
                className={`group relative ${item.aspect} ${item.width} flex-shrink-0 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300`}
              >
                <img
                  src={`https://picsum.photos/seed/${item.seed}/${item.imgSize}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-semibold text-white drop-shadow">
                    {item.title}
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
          <div className="inline-flex items-center justify-center mb-[10px]">
            <img
              src="/assets/icons/alarm.svg"
              alt="Notification"
              className="w-[40px] h-[42px]"
            />
          </div>
          <h2 className="text-h2 text-gray-900">
            Travel-Fit AI is about to get even smarter.
          </h2>
          <p className="text-body-l text-gray-800 mt-4">
            Sign up to get early access to our beta launch and exclusive perks for marketers.
          </p>

          <form onSubmit={handleWaitlistSubmit} className="mt-[40px]">
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-5 py-4 text-body-m text-gray-700 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all placeholder:text-gray-700"
              />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full px-5 py-4 text-left text-body-m text-gray-900 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 bg-white flex items-center justify-between"
                >
                  <span>{jobTitle ? JOB_OPTIONS.find((job) => job.value === jobTitle)?.label : 'Job Role'}</span>
                  <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          className={`w-full px-5 py-3 text-left text-body-m text-gray-900 transition-colors ${
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
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-body-m-bold text-gray-100 bg-[#007ED3] hover:bg-[#006BB3] transition-all shadow-lg mt-10"
            >
              Get Updates
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/60">
        <div className="max-w-6xl mx-auto px-6 pt-[100px] pb-[40px] flex flex-col items-center justify-center gap-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-white/80 backdrop-blur text-body-m-bold text-gray-800 hover:bg-white transition-all"
          >
            Contact Us
          </button>
          <div className="text-body-s text-gray-800">
            © 2025 Travel-Fit AI. All rights reserved. | <span className="text-primary">Powered by Readdy</span>
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
            className="bg-white rounded-3xl shadow-2xl w-[896px] h-[600px] flex overflow-hidden relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Side - Form */}
            <div className="flex-1 p-8 flex flex-col">
              <h2 className="text-h3 text-gray-900 mb-8">
                Contact Us
              </h2>

              <form onSubmit={handleInquirySubmit} className="space-y-6 flex-1 flex flex-col">
                <div>
                  <label className="block text-body-m text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all text-body-m"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-body-m text-gray-700 mb-2">
                    Enter your message
                  </label>
                  <textarea
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    required
                    rows={6}
                    maxLength={500}
                    className="w-full flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all resize-none text-body-m"
                    placeholder="Tell us how we can help you."
                  />
                  <div className="text-right text-sm text-gray-500 mt-2">
                    {inquiryMessage.length}/500
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-[#006BB3] text-body-m-bold text-gray-100 py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Send
                </button>
              </form>
            </div>

            {/* Right Side - Image */}
            <div className="w-[400px] h-full flex-shrink-0 hidden md:block">
              <img
                src="https://picsum.photos/seed/business-meeting/400/600"
                alt="Business meeting"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
