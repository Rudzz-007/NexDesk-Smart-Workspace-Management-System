import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Monitor, 
  TrendingUp, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Building2, 
  ArrowRight, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Are there hidden fees?",
    answer: "No. The final price shown to you during checkout is exactly what you pay. NexDesk does not add separate platform service charges or surprise taxes at checkout. Everything is clearly displayed upfront before you confirm your reservation."
  },
  {
    question: "How do refunds and cancellations work?",
    answer: "You can cancel any confirmed booking instantly from your My Bookings dashboard before your session window starts. Clicking 'Cancel booking' sends a DELETE request to our backend API, freeing up the desk for other coworkers and confirming your cancellation immediately."
  },
  {
    question: "Can prices change after I book?",
    answer: "Never. While our Linear Regression machine learning engine dynamically calculates rates based on local surge multipliers and peak demand, once you lock in your reservation and click 'Book Now', your price is guaranteed and frozen."
  }
];

export default function PricingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16">
      {/* ─── Hero Section ─── */}
      <section className="bg-gradient-to-br from-[#eff6ff] via-white to-[#f8fafc] border-b border-[#e2e8f0] py-16 sm:py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#2563eb] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={13} />
            Per-Desk Dynamic Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0f172a] tracking-tight leading-tight">
            Simple, transparent <span className="text-[#3b82f6]">desk pricing</span>
          </h1>
          <p className="text-base sm:text-lg text-[#64748b] mt-4 max-w-2xl mx-auto font-medium">
            Each workspace across our 12+ tech hubs is individually priced by its host or coworking partner. See exact final rates upfront before you book—no hidden fees, ever.
          </p>
        </div>
      </section>

      {/* ─── What Affects the Price Section ─── */}
      <section className="container-nd py-16 px-4 max-w-6xl">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-wider text-[#3b82f6] mb-2">Fair & Intelligent</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">What affects the price of a desk?</h2>
          <p className="text-sm sm:text-base text-[#64748b] mt-2 max-w-xl mx-auto">
            Our machine learning engine balances host rates with real-time conditions to ensure transparent, market-driven pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Factor 1 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
            <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
              <MapPin size={24} />
            </div>
            <h3 className="text-base font-bold text-[#0f172a] mb-2">Location & Hub Zone</h3>
            <p className="text-sm text-[#64748b] leading-relaxed">
              Prime tech corridors and financial districts naturally command higher base rates than neighborhood spaces or suburban incubators.
            </p>
          </div>

          {/* Factor 2 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
            <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
              <Monitor size={24} />
            </div>
            <h3 className="text-base font-bold text-[#0f172a] mb-2">Workspace Amenities</h3>
            <p className="text-sm text-[#64748b] leading-relaxed">
              Desks equipped with dedicated 4K external dual monitors, ergonomic Herman Miller chairs, or high-speed fiber lines reflect higher equipment value.
            </p>
          </div>

          {/* Factor 3 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
            <div className="w-12 h-12 rounded-xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-base font-bold text-[#0f172a] mb-2">ML Dynamic Pricing</h3>
            <p className="text-sm text-[#64748b] leading-relaxed">
              Our Linear Regression algorithm calculates optimal <code>final_price</code> rates in real time based on occupancy trends, peak hour demand, and surge overrides.
            </p>
          </div>

          {/* Factor 4 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
            <div className="w-12 h-12 rounded-xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-base font-bold text-[#0f172a] mb-2">Reliability & No-Show Risk</h3>
            <p className="text-sm text-[#64748b] leading-relaxed">
              Our system tracks check-in consistency via <code>noshow_probability</code>. Reliable coworkers help prevent artificial scarcity and maintain open inventory.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Example Listings Section ─── */}
      <section className="container-nd py-12 px-4 max-w-6xl">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-10 flex items-start sm:items-center gap-3 text-blue-900">
          <Info className="text-[#3b82f6] flex-shrink-0 mt-0.5 sm:mt-0" size={20} />
          <p className="text-xs sm:text-sm">
            <strong>Note:</strong> NexDesk is an on-demand hot desk booking platform—not a fixed monthly subscription service. The cards below represent real-world <strong>example listings</strong> from our network.
          </p>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">Example desk listings & rates</h2>
          <p className="text-sm sm:text-base text-[#64748b] mt-2">
            Browse typical price points across our partner locations before reserving your exact session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Example 1: Basic */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] bg-slate-100 px-2.5 py-1 rounded-md">
                  Essential Tier
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Host
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#0f172a] mb-1">Essential Hot Desk</h3>
              <p className="text-xs text-[#64748b] mb-6 flex items-center gap-1">
                <MapPin size={13} className="text-[#3b82f6]" /> Koramangala, Bengaluru
              </p>

              <div className="mb-6 pb-6 border-b border-[#f1f5f9]">
                <span className="text-3xl font-black text-[#0f172a]">₹200</span>
                <span className="text-xs text-[#64748b] font-medium"> / session (approx.)</span>
              </div>

              <p className="text-xs font-bold text-[#334155] uppercase tracking-wider mb-3">Included Amenities:</p>
              <ul className="space-y-2.5 mb-8 text-sm text-[#475569]">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>High-speed WiFi (100+ Mbps)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Ergonomic task seating</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Dedicated power outlet</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Common lounge area access</span>
                </li>
              </ul>
            </div>

            <Link
              to="/browse"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-sm font-bold transition-colors"
            >
              Browse similar desks
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Example 2: Standard (Highlighted) */}
          <div className="bg-white border-2 border-[#3b82f6] rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
              Most Popular
            </div>
            <div>
              <div className="flex items-center justify-between mb-3 mt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3b82f6] bg-blue-50 px-2.5 py-1 rounded-md">
                  Pro Tier
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Host
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#0f172a] mb-1">Pro Workspace Desk</h3>
              <p className="text-xs text-[#64748b] mb-6 flex items-center gap-1">
                <MapPin size={13} className="text-[#3b82f6]" /> HSR Layout, Bengaluru
              </p>

              <div className="mb-6 pb-6 border-b border-[#f1f5f9]">
                <span className="text-3xl font-black text-[#0f172a]">₹350</span>
                <span className="text-xs text-[#64748b] font-medium"> / session (approx.)</span>
              </div>

              <p className="text-xs font-bold text-[#334155] uppercase tracking-wider mb-3">Included Amenities:</p>
              <ul className="space-y-2.5 mb-8 text-sm text-[#475569]">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Dedicated 27" 4K external monitor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Electric motorized sit-stand desk</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Gigabit fiber connection & backup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Unlimited specialty coffee & tea</span>
                </li>
              </ul>
            </div>

            <Link
              to="/browse"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-bold transition-colors shadow-sm"
            >
              Browse similar desks
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Example 3: Premium */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748b] bg-slate-100 px-2.5 py-1 rounded-md">
                  Executive Tier
                </span>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Host
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-[#0f172a] mb-1">Executive Suite Desk</h3>
              <p className="text-xs text-[#64748b] mb-6 flex items-center gap-1">
                <MapPin size={13} className="text-[#3b82f6]" /> Bandra Kurla Complex, Mumbai
              </p>

              <div className="mb-6 pb-6 border-b border-[#f1f5f9]">
                <span className="text-3xl font-black text-[#0f172a]">₹600</span>
                <span className="text-xs text-[#64748b] font-medium"> / session (approx.)</span>
              </div>

              <p className="text-xs font-bold text-[#334155] uppercase tracking-wider mb-3">Included Amenities:</p>
              <ul className="space-y-2.5 mb-8 text-sm text-[#475569]">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Private soundproof focus cubicle</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Dual external monitors + dock</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>Priority IT support & dedicated locker</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-[#3b82f6] flex-shrink-0" />
                  <span>1-hour meeting room credit included</span>
                </li>
              </ul>
            </div>

            <Link
              to="/browse"
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f172a] text-sm font-bold transition-colors"
            >
              Browse similar desks
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ Accordion Section ─── */}
      <section className="container-nd max-w-3xl px-4 py-12">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#e2e8f0] bg-gradient-to-r from-white to-[#f8fafc] flex items-center gap-2.5">
            <HelpCircle className="text-[#3b82f6]" size={20} />
            <h2 className="text-lg font-extrabold text-[#0f172a]">Pricing Questions & Answers</h2>
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

      {/* ─── Call to Action Band ─── */}
      <section className="container-nd max-w-4xl px-4 py-8 text-center">
        <div className="bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded-3xl p-8 sm:p-12 text-white shadow-md relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
          <h2 className="text-xl sm:text-3xl font-black mb-4">Ready to find your next workspace?</h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-lg mx-auto mb-8 font-medium">
            Explore hundreds of verified hot desks with real-time pricing and instant QR check-ins across India.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/browse"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#2563eb] text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm"
            >
              Browse Hot Desks
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2563eb]/20 border border-white/20 text-white text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
