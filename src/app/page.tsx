import Link from "next/link";
import {
  ArrowRight,
  Database,
  Recycle,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F4F3EC] text-black flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b-2 border-black bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#FDE047] border-2 border-black flex items-center justify-center font-black text-lg">
            R
          </div>
          <div>
            <div className="font-black text-xl tracking-wider leading-none">
              RELOVA
            </div>
            <div className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              SIMPLIFIED DBMS EDITION
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 border-2 border-black bg-white font-bold text-sm brutal-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 border-2 border-black bg-[#FDE047] font-bold text-sm brutal-shadow hover:translate-x-[1px] hover:translate-y-[1px] transition-all flex items-center gap-1.5"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#86EFAC] border-2 border-black brutal-shadow-sm mb-6 w-fit">
          <Database className="w-4 h-4 text-black" />
          <span className="font-mono text-xs font-black uppercase tracking-wider">
            8-TABLE NORMALIZED RELATIONAL ARCHITECTURE
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-6">
          B2B Industrial Surplus &amp;
          <br />
          <span className="bg-[#FDE047] px-2 border-2 border-black inline-block mt-2">
            Circular Material Exchange
          </span>
        </h1>

        <p className="text-lg md:text-xl font-medium max-w-2xl mb-8 text-gray-800">
          Connect industrial surplus generators with regional craftsmen and
          vocational workshops. Automated symbiosis scoring, custody verification,
          and verifiable landfill diversion metrics.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap gap-4 mb-16">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 bg-[#FDE047] border-2 border-black font-black text-base brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
          >
            <span>Enter Operations Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/materials"
            className="px-6 py-3.5 bg-white border-2 border-black font-bold text-base brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Explore Material Lots
          </Link>

          <Link
            href="/login"
            className="px-6 py-3.5 bg-[#7DD3FC] border-2 border-black font-bold text-base brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Switch Role / Auth
          </Link>
        </div>

        {/* Architecture Pill Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white border-2 border-black brutal-shadow-sm">
            <div className="font-mono text-xs font-black uppercase text-gray-500 mb-1">
              Table 01 &amp; 02
            </div>
            <div className="font-bold text-sm">Users &amp; Categories</div>
            <div className="text-xs text-gray-600 mt-1">
              Bilateral role scoping &amp; standard taxonomy
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-black brutal-shadow-sm">
            <div className="font-mono text-xs font-black uppercase text-gray-500 mb-1">
              Table 03 &amp; 04
            </div>
            <div className="font-bold text-sm">Lots &amp; Requests</div>
            <div className="text-xs text-gray-600 mt-1">
              Surplus publishing &amp; demand matching
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-black brutal-shadow-sm">
            <div className="font-mono text-xs font-black uppercase text-gray-500 mb-1">
              Table 05 &amp; 06
            </div>
            <div className="font-bold text-sm">Matches &amp; Exchanges</div>
            <div className="text-xs text-gray-600 mt-1">
              Multi-factor scoring &amp; chain of custody
            </div>
          </div>

          <div className="p-4 bg-white border-2 border-black brutal-shadow-sm">
            <div className="font-mono text-xs font-black uppercase text-gray-500 mb-1">
              Table 07 &amp; 08
            </div>
            <div className="font-bold text-sm">Events &amp; Impact</div>
            <div className="text-xs text-gray-600 mt-1">
              Immutable log &amp; verified CO₂e savings
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-black bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-gray-600">
        <div>RELOVA · ACADEMIC DBMS DEMONSTRATION VERSION</div>
        <div className="mt-2 sm:mt-0 font-bold text-black">
          PostgreSQL Ready Schema
        </div>
      </footer>
    </div>
  );
}
