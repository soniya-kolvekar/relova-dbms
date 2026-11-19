"use client";

import React from "react";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { useRelova } from "@/context/RelovaContext";
import {
  Boxes,
  FileQuestion,
  Sparkles,
  ArrowLeftRight,
  PlusCircle,
  Search,
  ArrowRight,
  Leaf,
  Scale,
  Activity,
  AlertCircle,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const {
    currentUser,
    lots,
    requests,
    matches,
    exchanges,
    exchangeEvents,
    environmentalStats,
    loading,
    dbConnected,
  } = useRelova();

  // Dynamic metrics from actual database records
  const activeLots = lots.filter((l) => l.status === "available");
  const totalAvailableKg = activeLots
    .filter((l) => (l.unit || "").toLowerCase().includes("kg"))
    .reduce((sum, l) => sum + Number(l.quantity || 0), 0);

  const openRequests = requests.filter((r) => r.status === "open");
  const suggestedMatches = matches.filter((m) => m.status === "suggested");
  const ongoingExchanges = exchanges.filter((e) => e.status !== "completed");

  return (
    <AppShell>
      {/* Welcome Banner */}
      <div className="bg-white border-2 border-black brutal-shadow p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="brutal-badge bg-[#FDE047]">
              OPERATOR DUAL PORTAL
            </span>
            <span className="font-mono text-xs text-gray-600 font-bold">
              {currentUser?.location || "Bengaluru Node"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-black tracking-tight">
            {currentUser ? `Welcome, ${currentUser.full_name}` : "Operations Dashboard"}
          </h1>
          <p className="text-xs font-mono text-gray-700 mt-1">
            Organization:{" "}
            <span className="font-bold text-black">
              {currentUser?.organization || "Not Logged In (Browse Mode)"}
            </span>
          </p>
        </div>

        {/* Action buttons (Unified Dual capability) */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/post-material"
            className="brutal-btn px-4 py-2 text-xs flex items-center gap-1.5 uppercase"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Surplus Lot</span>
          </Link>
          <Link
            href="/requests"
            className="brutal-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 uppercase"
          >
            <FileQuestion className="w-4 h-4" />
            <span>Post Demand Spec</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid (Real-time computed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Available Material */}
        <div className="bg-white border-2 border-black brutal-shadow-sm p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-600 mb-2">
            <span className="font-mono text-xs font-black uppercase">
              Available Surplus
            </span>
            <Boxes className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-black">
              {totalAvailableKg.toLocaleString()}{" "}
              <span className="text-sm font-bold">kg</span>
            </div>
            <div className="font-mono text-[11px] text-gray-600 mt-1">
              Across {activeLots.length} active listings
            </div>
          </div>
        </div>

        {/* Open Demands */}
        <div className="bg-white border-2 border-black brutal-shadow-sm p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-600 mb-2">
            <span className="font-mono text-xs font-black uppercase">
              Open Demands
            </span>
            <FileQuestion className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-black">
              {openRequests.length}
            </div>
            <div className="font-mono text-[11px] text-gray-600 mt-1">
              Active requirements registered
            </div>
          </div>
        </div>

        {/* Suggested Matches */}
        <div className="bg-white border-2 border-black brutal-shadow-sm p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-600 mb-2">
            <span className="font-mono text-xs font-black uppercase">
              Matches Found
            </span>
            <Sparkles className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-black">
              {suggestedMatches.length}
            </div>
            <div className="font-mono text-[11px] text-gray-600 mt-1">
              Symbiosis pairs ready for review
            </div>
          </div>
        </div>

        {/* Ongoing Exchanges */}
        <div className="bg-white border-2 border-black brutal-shadow-sm p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-600 mb-2">
            <span className="font-mono text-xs font-black uppercase">
              Active Exchanges
            </span>
            <ArrowLeftRight className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-3xl font-black font-mono text-black">
              {ongoingExchanges.length}
            </div>
            <div className="font-mono text-[11px] text-gray-600 mt-1">
              In custody handover pipeline
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Environmental Impact (Only from completed exchanges) */}
      <div className="bg-[#86EFAC] border-2 border-black brutal-shadow p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-black" />
            <h2 className="text-lg font-black uppercase tracking-tight text-black">
              Live ESG Landfill Diversion Metrics
            </h2>
          </div>
          <span className="font-mono text-[11px] font-bold text-gray-800 bg-white/70 px-2 py-0.5 border border-black">
            * COMPUTED DIRECTLY FROM COMPLETED EXCHANGES ({environmentalStats.completed_exchanges_count} CLOSED)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
          <div className="bg-white border-2 border-black p-4 brutal-shadow-sm">
            <div className="text-[11px] text-gray-600 uppercase font-bold">
              Total Material Diverted
            </div>
            <div className="text-2xl font-black text-black mt-1">
              {environmentalStats.total_diverted_kg.toLocaleString()}{" "}
              <span className="text-xs font-normal">kg</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Physical weight verified at weigh-in
            </div>
          </div>

          <div className="bg-white border-2 border-black p-4 brutal-shadow-sm">
            <div className="text-[11px] text-gray-600 uppercase font-bold">
              Avoided Scope 3 CO₂e
            </div>
            <div className="text-2xl font-black text-black mt-1">
              {environmentalStats.total_co2e_saved_kg.toLocaleString()}{" "}
              <span className="text-xs font-normal">kg CO₂e</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Lifecycle emissions avoided
            </div>
          </div>

          <div className="bg-white border-2 border-black p-4 brutal-shadow-sm">
            <div className="text-[11px] text-gray-600 uppercase font-bold">
              Embodied Water Saved
            </div>
            <div className="text-2xl font-black text-black mt-1">
              {environmentalStats.total_water_saved_litres.toLocaleString()}{" "}
              <span className="text-xs font-normal">litres</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Manufacturing water preserved
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions + Real-Time Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions (1 col) */}
        <div className="space-y-4">
          <h2 className="font-mono text-xs font-black uppercase text-gray-500 tracking-wider">
            Operational Shortcuts
          </h2>

          <div className="bg-white border-2 border-black brutal-shadow-sm p-4 space-y-2.5">
            <Link
              href="/post-material"
              className="flex items-center justify-between p-3 border-2 border-black bg-[#F4F3EC] hover:bg-[#FDE047] font-bold text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" />
                <span>Publish Surplus Lot</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/requests"
              className="flex items-center justify-between p-3 border-2 border-black bg-[#F4F3EC] hover:bg-[#86EFAC] font-bold text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileQuestion className="w-4 h-4" />
                <span>Post Demand Spec</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/materials"
              className="flex items-center justify-between p-3 border-2 border-black bg-[#F4F3EC] hover:bg-[#7DD3FC] font-bold text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4" />
                <span>Browse Inventory ({lots.length})</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/exchanges"
              className="flex items-center justify-between p-3 border-2 border-black bg-[#F4F3EC] hover:bg-[#F472B6] font-bold text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="w-4 h-4" />
                <span>Matches &amp; Exchanges</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Real Activity Stream from exchange_events Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-xs font-black uppercase text-gray-500 tracking-wider">
              Custody Event Stream (PostgreSQL Table: exchange_events)
            </h2>
            <Link
              href="/exchanges"
              className="font-mono text-[11px] font-bold underline hover:text-gray-700"
            >
              View Exchanges →
            </Link>
          </div>

          <div className="bg-white border-2 border-black brutal-shadow-sm divide-y-2 divide-black">
            {exchangeEvents.length === 0 ? (
              <div className="p-8 text-center font-mono text-xs text-gray-500">
                No exchange events recorded in database yet.
                <div className="mt-1">
                  Accept a match on the Exchanges page to initiate the custody chain!
                </div>
              </div>
            ) : (
              exchangeEvents.slice(0, 5).map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 flex items-start justify-between gap-3 hover:bg-[#F4F3EC] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 border-2 border-black bg-[#FDE047] flex items-center justify-center font-mono text-xs font-bold mt-0.5 shrink-0">
                      {evt.event_type === "completed"
                        ? "✓"
                        : evt.event_type === "weigh_in_recorded"
                        ? "⚖"
                        : "↔"}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-black">
                        {evt.title}
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">
                        {evt.description}
                      </div>
                      <div className="font-mono text-[10px] text-gray-500 mt-1">
                        Actor: <span className="font-bold">{evt.actor_name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-[10px] text-gray-500 shrink-0 text-right">
                    {formatDate(evt.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
