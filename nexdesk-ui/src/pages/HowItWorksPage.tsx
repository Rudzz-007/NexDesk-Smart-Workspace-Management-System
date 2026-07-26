import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  CalendarDays, 
  QrCode, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Clock, 
  ShieldCheck, 
  CreditCard,
  Building2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What if I'm late to check in?",
    answer: "If you do not check in within 30 seconds of generating your check-in code, the system's Auto-Release Watchdog will automatically release your reservation, mark it as 'no_show', and open the hot desk inventory back up to other coworkers. The verification attempt will return a '410 Gone' expiration error."
  },
  {
    question: "Can I cancel a booking?",
    answer: "Yes, you can cancel any confirmed booking directly from your My Bookings dashboard. Clicking 'Cancel booking' makes a DELETE request to our server, which instantly updates the booking status to 'cancelled', frees the desk, and displays a success confirmation."
  },
  {
    question: "How is pricing calculated?",
    answer: "NexDesk uses machine learning algorithms (Linear Regression) to predict optimal prices. Base prices are adjusted in real-time based on local surge multipliers, workspace zones, and specific amenities. The price you see during booking is final."
  },
  {
    question: "What cities are you currently in?",
    answer: "We are currently operating in India's top tech hubs including Bangalore, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, Jaipur, Kochi, Chandigarh, and Indore."
  },
  {
    question: "Is pricing transparent?",
    answer: "Absolutely. There are no hidden fees. When you select a time window and click Book Now, you see the exact final price calculated for your session, along with the ML-predicted no-show probability."
  },
  {
    question: "What amenities are included with my desk?",
    answer: "Amenities vary by desk but typically include high-speed WiFi, dedicated external monitors, ergonomic chairs, coffee, lockers, whiteboard access, and power outlets. You can filter by specific amenities on the Browse page."
  }
];

export default function HowItWorksPage() {
  const { user } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16">
      {/* ─── Hero Section ─── */}
      <section className="bg-gradient-to-br from-[#eff6ff] to-white border-b border-[#e2e8f0] py-16 sm:py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#2563eb] text-xs font-semibold uppercase tracking-wider mb-4">
            <Building2 size={13} />
            Smart Workspace Platform
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0f172a] tracking-tight leading-tight">
            How <span className="text-[#3b82f6]">NexDesk</span> works
          </h1>
          <p className="text-base sm:text-lg text-[#64748b] mt-4 max-w-xl mx-auto font-medium">
            Book on-demand verified hot desks in India's top hubs with instant confirmation, dynamic pricing, and secure QR check-ins.
          </p>
        </div>
      </section>

      {/* ─── The 3-Step Process ─── */}
      <section className="container-nd py-16 px-4 max-w-5xl">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-wider text-[#3b82f6] mb-2">Simplicity at its core</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">Your desk in three easy steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector lines for desktop */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-[#cbd5e1] z-0" />

          {/* Step 1 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 z-10 flex flex-col items-center text-center relative group">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
              1
            </div>
            <div className="w-16 h-16 rounded-2xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center mb-6 mt-2 shadow-inner">
              <Search size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Search Workspace</h3>
            <p className="text-sm text-[#64748b] leading-relaxed">
              Explore hot desks across 12+ tech hubs. Filter dynamically by price, location, verified status, or amenities like external monitors, WiFi, and dedicated power.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 z-10 flex flex-col items-center text-center relative group">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
              2
            </div>
            <div className="w-16 h-16 rounded-2xl bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center mb-6 mt-2 shadow-inner">
              <CalendarDays size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Book with Ease</h3>
            <p className="text-sm text-[#64748b] leading-relaxed">
              Choose your date and time window. Our machine learning engine dynamically calculates optimal final pricing and no-show probabilities to guarantee booking integrity.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 z-10 flex flex-col items-center text-center relative group">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-110 transition-transform">
              3
            </div>
            <div className="w-16 h-16 rounded-2xl bg-[#fef2f2] text-[#ef4444] flex items-center justify-center mb-6 mt-2 shadow-inner">
              <QrCode size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-2">Check-in via QR</h3>
            <p className="text-sm text-[#64748b] leading-relaxed">
              Once booked, generate your secure check-in QR token. Verify physical presence by scanning the code. Note that you have a <strong>30-second verification window</strong>; otherwise, the desk is auto-released to keep the ecosystem active!
            </p>
          </div>
        </div>
      </section>

      {/* ─── FAQ Accordion Section ─── */}
      <section className="container-nd max-w-3xl px-4 py-8">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#e2e8f0] bg-gradient-to-r from-white to-[#f8fafc] flex items-center gap-2.5">
            <HelpCircle className="text-[#3b82f6]" size={20} />
            <h2 className="text-lg font-extrabold text-[#0f172a]">Frequently Asked Questions</h2>
          </div>

          <div className="divide-y divide-[#e2e8f0]">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="bg-white transition-colors duration-150">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-[#1e293b] hover:text-[#0f172a] hover:bg-[#f8fafc] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]"
                    aria-expanded={isOpen}
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <ChevronUp size={18} className="text-[#3b82f6] flex-shrink-0" />
                    ) : (
                      <ChevronDown size={18} className="text-[#64748b] flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-[#475569] leading-relaxed bg-[#f8fafc]/50 border-t border-[#f1f5f9]">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Call to Action ─── */}
      <section className="container-nd max-w-3xl px-4 py-8 text-center">
        <div className="bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-3xl p-8 sm:p-12 text-white shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <h2 className="text-xl sm:text-3xl font-black mb-4">Ready to reserve your workspace?</h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto mb-8 font-medium">
            Browse our verified hot desks and lock in your ML-priced slot within seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/browse"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#2563eb] text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
            >
              Browse Hot Desks
              <ArrowRight size={15} />
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2563eb]/20 border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2563eb]/20 border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
