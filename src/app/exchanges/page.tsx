"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useRelova } from "@/context/RelovaContext";
import {
  Sparkles,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Scale,
  ShieldCheck,
  Building2,
  KeyRound,
  Leaf,
  X,
  AlertCircle,
} from "lucide-react";
import { Exchange } from "@/types";
import { formatDate, getStatusBadge } from "@/lib/utils";

export default function ExchangesPage() {
  const {
    matches,
    exchanges,
    exchangeEvents,
    acceptMatch,
    rejectMatch,
    advanceExchange,
    recordWeighIn,
    completeExchange,
  } = useRelova();

  const [activeTab, setActiveTab] = useState<"matches" | "exchanges">("matches");

  // Modals
  const [weighInExchange, setWeighInExchange] = useState<Exchange | null>(null);
  const [verifyExchange, setVerifyExchange] = useState<Exchange | null>(null);
  const [selectedExchangeEvents, setSelectedExchangeEvents] = useState<Exchange | null>(null);

  // Form states
  const [measuredKg, setMeasuredKg] = useState<number | "">("");
  const [scaleId, setScaleId] = useState("SCALE-RMS-04");
  const [verifyCodeInput, setVerifyCodeInput] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleWeighInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weighInExchange || !measuredKg || Number(measuredKg) <= 0) return;
    setActionLoading(true);
    await recordWeighIn(weighInExchange.id, Number(measuredKg), scaleId);
    setActionLoading(false);
    setWeighInExchange(null);
    setMeasuredKg("");
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    if (!verifyExchange) return;

    setActionLoading(true);
    const result = await completeExchange(verifyExchange.id, verifyCodeInput);
    setActionLoading(false);

    if (!result.success) {
      setVerifyError(result.error || "Invalid custody verification token.");
      return;
    }

    setVerifySuccess(true);
    setTimeout(() => {
      setVerifySuccess(false);
      setVerifyExchange(null);
      setVerifyCodeInput("");
    }, 900);
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-black tracking-tight">
            Matching &amp; Custody Ledger
          </h1>
          <p className="text-xs font-mono text-gray-600 mt-1">
            Real-time feed from PostgreSQL tables:{" "}
            <span className="font-bold text-black">matches</span> &amp;{" "}
            <span className="font-bold text-black">exchanges</span>
          </p>
        </div>

        <div className="flex border-2 border-black bg-white p-1">
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-4 py-1.5 font-mono text-xs font-black uppercase flex items-center gap-1.5 transition-all ${
              activeTab === "matches"
                ? "bg-[#FDE047] border border-black brutal-shadow-sm text-black"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Matches ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("exchanges")}
            className={`px-4 py-1.5 font-mono text-xs font-black uppercase flex items-center gap-1.5 transition-all ${
              activeTab === "exchanges"
                ? "bg-[#86EFAC] border border-black brutal-shadow-sm text-black"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Custody Exchanges ({exchanges.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MATCHES */}
      {activeTab === "matches" && (
        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="bg-white border-2 border-black brutal-shadow p-12 text-center font-mono">
              <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="font-bold text-sm text-black uppercase">
                No active compatibility matches in database
              </div>
              <div className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                Matches are generated automatically by PostgreSQL database triggers whenever a published surplus lot aligns with an open demand request.
              </div>
            </div>
          ) : (
            matches.map((m) => {
              const isAccepted = m.status === "accepted";
              const isRejected = m.status === "rejected";

              return (
                <div
                  key={m.id}
                  className={`border-2 border-black brutal-shadow p-5 transition-all ${
                    isAccepted
                      ? "bg-[#F4FDF7]"
                      : isRejected
                      ? "bg-gray-100 opacity-60"
                      : "bg-white"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Score Badge + Details */}
                    <div className="flex items-start gap-4">
                      {/* Compatibility Score Dial */}
                      <div className="w-16 h-16 bg-[#FDE047] border-2 border-black flex flex-col items-center justify-center font-mono shrink-0 brutal-shadow-sm">
                        <span className="text-xl font-black text-black leading-none">
                          {m.match_score}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-black mt-0.5">
                          SCORE
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`brutal-badge ${
                              isAccepted
                                ? "bg-[#86EFAC]"
                                : isRejected
                                ? "bg-red-200"
                                : "bg-[#FDE047]"
                            }`}
                          >
                            {m.status.toUpperCase()}
                          </span>
                          <span className="font-mono text-xs text-gray-500">
                            Evaluated: {formatDate(m.created_at)}
                          </span>
                        </div>

                        <h3 className="font-black text-base text-black">
                          {m.lot_title}{" "}
                          <span className="text-gray-400 font-normal">↔</span>{" "}
                          {m.request_title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-gray-700 mt-1.5">
                          <div>
                            Provider:{" "}
                            <span className="font-bold text-black">
                              {m.provider_org}
                            </span>
                          </div>
                          <div>•</div>
                          <div>
                            Recipient:{" "}
                            <span className="font-bold text-black">
                              {m.recipient_org}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Factors breakdown */}
                    <div className="grid grid-cols-4 gap-2 bg-[#F4F3EC] border border-black p-2 font-mono text-center text-xs shrink-0">
                      <div>
                        <div className="text-[9px] text-gray-500">CATEGORY</div>
                        <div className="font-bold">{m.category_fit || 100}%</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500">QUANTITY</div>
                        <div className="font-bold">{m.quantity_fit || 95}%</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500">GRADE</div>
                        <div className="font-bold">{m.condition_fit || 90}%</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-gray-500">PROXIMITY</div>
                        <div className="font-bold">{m.proximity_fit || 85}%</div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {m.status === "suggested" ? (
                        <>
                          <button
                            onClick={() => acceptMatch(m.id)}
                            className="brutal-btn px-4 py-2 text-xs uppercase flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept Match</span>
                          </button>
                          <button
                            onClick={() => rejectMatch(m.id)}
                            className="p-2 border-2 border-black bg-white hover:bg-red-100 text-black font-bold text-xs"
                            title="Reject Match"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="font-mono text-xs font-bold text-gray-600">
                          {isAccepted ? "✓ Exchange Initiated" : "✕ Rejected"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: EXCHANGES */}
      {activeTab === "exchanges" && (
        <div className="space-y-6">
          {exchanges.length === 0 ? (
            <div className="bg-white border-2 border-black brutal-shadow p-12 text-center font-mono">
              <ArrowLeftRight className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <div className="font-bold text-sm text-black uppercase">
                No active custody exchanges
              </div>
              <div className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Accept a symbiosis match in Tab 1 to initiate an exchange lifecycle.
              </div>
            </div>
          ) : (
            exchanges.map((exch) => {
              const isCompleted = exch.status === "completed";

              const stepIndex =
                exch.status === "submitted"
                  ? 1
                  : exch.status === "accepted"
                  ? 2
                  : exch.status === "logistics_scheduled"
                  ? 3
                  : 4;

              return (
                <div
                  key={exch.id}
                  className="bg-white border-2 border-black brutal-shadow p-6 space-y-6"
                >
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="brutal-badge bg-[#FDE047]">
                        {exch.exchange_code}
                      </span>
                      <span className={`brutal-badge ${getStatusBadge(exch.status).bg}`}>
                        {getStatusBadge(exch.status).label}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-gray-600">
                      Created: {formatDate(exch.created_at)}
                    </div>
                  </div>

                  {/* Material & Nodes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">
                        MATERIAL TRANSFER
                      </span>
                      <div className="font-black text-sm text-black">
                        {exch.material_name}
                      </div>
                      <div className="text-gray-700 mt-0.5">
                        Agreed:{" "}
                        <span className="font-bold">
                          {Number(exch.agreed_quantity).toLocaleString()} {exch.unit}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">
                        SUPPLY &amp; RECIPIENT NODES
                      </span>
                      <div>
                        From: <span className="font-bold">{exch.provider_org}</span>
                      </div>
                      <div>
                        To: <span className="font-bold">{exch.recipient_org}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">
                        DISPATCH &amp; HANDOVER LOCATION
                      </span>
                      <div className="font-bold">{exch.scheduled_pickup || "Window Pending"}</div>
                      <div className="text-gray-600">{exch.pickup_location || "Central Bay"}</div>
                    </div>
                  </div>

                  {/* Progress Stepper */}
                  <div className="pt-2">
                    <div className="font-mono text-[10px] font-bold text-gray-500 uppercase mb-2">
                      CUSTODY PIPELINE STEPPER
                    </div>
                    <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
                      {[
                        { num: 1, label: "1. Submitted" },
                        { num: 2, label: "2. Accepted" },
                        { num: 3, label: "3. Logistics" },
                        { num: 4, label: "4. Completed" },
                      ].map((step) => {
                        const isPastOrCurrent = stepIndex >= step.num;
                        return (
                          <div
                            key={step.num}
                            className={`p-2 border-2 border-black font-bold ${
                              isPastOrCurrent
                                ? "bg-[#86EFAC] text-black"
                                : "bg-[#F4F3EC] text-gray-400"
                            }`}
                          >
                            {step.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Bar & Custody Token */}
                  <div className="bg-[#F4F3EC] border-2 border-black p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Custody Code Box */}
                    <div className="flex items-center gap-3">
                      <KeyRound className="w-5 h-5 text-black shrink-0" />
                      <div>
                        <div className="font-mono text-[10px] font-bold text-gray-600 uppercase">
                          Handover Verification Code
                        </div>
                        <div className="font-mono text-sm font-black tracking-widest text-black">
                          {exch.verification_code}
                        </div>
                      </div>
                    </div>

                    {/* Operational Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {/* View Event Log */}
                      <button
                        onClick={() => setSelectedExchangeEvents(exch)}
                        className="brutal-btn-secondary px-3 py-1.5 text-xs font-mono"
                      >
                        Audit Trail ({exchangeEvents.filter((e) => e.exchange_id === exch.id).length})
                      </button>

                      {/* Weigh In Button */}
                      <button
                        onClick={() => setWeighInExchange(exch)}
                        className="px-3 py-1.5 border-2 border-black bg-white hover:bg-[#FDE047] font-mono text-xs font-bold flex items-center gap-1.5"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>
                          {exch.measured_quantity_kg
                            ? `Weighed: ${exch.measured_quantity_kg} kg`
                            : "Record Weigh-In"}
                        </span>
                      </button>

                      {/* Advance Step / Verify Button */}
                      {!isCompleted && exch.status === "logistics_scheduled" && (
                        <button
                          onClick={() => setVerifyExchange(exch)}
                          className="brutal-btn px-4 py-1.5 text-xs font-mono flex items-center gap-1.5 bg-[#86EFAC]"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verify Handover</span>
                        </button>
                      )}

                      {!isCompleted && exch.status !== "logistics_scheduled" && (
                        <button
                          onClick={() => advanceExchange(exch.id)}
                          className="brutal-btn px-4 py-1.5 text-xs font-mono"
                        >
                          Schedule Logistics →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Impact Badge for completed */}
                  {isCompleted && (
                    <div className="p-3 bg-[#86EFAC] border border-black flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-black" />
                        <span className="font-bold text-black uppercase">
                          Exchange Settled &amp; ESG Record Inserted into PostgreSQL!
                        </span>
                      </div>
                      <span className="text-gray-700">
                        Closed on {formatDate(exch.completed_at || "")}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* WEIGH-IN MODAL */}
      {weighInExchange && (
        <div
          onClick={() => setWeighInExchange(null)}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-black brutal-shadow-lg max-w-md w-full p-6 relative"
          >
            <button
              onClick={() => setWeighInExchange(null)}
              className="absolute top-4 right-4 p-1.5 border border-black bg-[#F4F3EC]"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-black uppercase text-black mb-1 flex items-center gap-2">
              <Scale className="w-5 h-5" />
              <span>Certified Scale Weigh-In</span>
            </h2>
            <p className="text-xs font-mono text-gray-600 mb-4">
              Enter official physical scale measurement for {weighInExchange.exchange_code}.
            </p>

            <form onSubmit={handleWeighInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1">
                  Measured Gross Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={measuredKg}
                  onChange={(e) =>
                    setMeasuredKg(
                      e.target.value === "" ? "" : parseFloat(e.target.value)
                    )
                  }
                  className="w-full brutal-input text-xs"
                  placeholder="e.g. 52.4"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1">
                  Scale Terminal Device ID
                </label>
                <input
                  type="text"
                  value={scaleId}
                  onChange={(e) => setScaleId(e.target.value)}
                  className="w-full brutal-input text-xs"
                  placeholder="SCALE-RMS-04"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWeighInExchange(null)}
                  className="brutal-btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="brutal-btn px-4 py-2 text-xs uppercase disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Measurement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VERIFY CUSTODY MODAL */}
      {verifyExchange && (
        <div
          onClick={() => setVerifyExchange(null)}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-black brutal-shadow-lg max-w-md w-full p-6 relative"
          >
            <button
              onClick={() => setVerifyExchange(null)}
              className="absolute top-4 right-4 p-1.5 border border-black bg-[#F4F3EC]"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-black uppercase text-black mb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-black" />
              <span>Redeem Custody Verification Code</span>
            </h2>
            <p className="text-xs font-mono text-gray-600 mb-4">
              Enter the token held by {verifyExchange.recipient_name} to confirm physical receipt.
            </p>

            <div className="mb-4 p-3 bg-[#F4F3EC] border border-black font-mono text-xs">
              Expected token:{" "}
              <span className="font-bold text-black">{verifyExchange.verification_code}</span>
            </div>

            {verifyError && (
              <div className="mb-4 p-3 bg-[#F472B6] border-2 border-black font-bold text-xs text-black">
                ⚠ {verifyError}
              </div>
            )}

            {verifySuccess && (
              <div className="mb-4 p-3 bg-[#86EFAC] border-2 border-black font-bold text-xs text-black flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Custody verified! Impact record created in database.
              </div>
            )}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1">
                  Enter Custody Code *
                </label>
                <input
                  type="text"
                  value={verifyCodeInput}
                  onChange={(e) => setVerifyCodeInput(e.target.value)}
                  className="w-full brutal-input text-xs font-mono font-bold uppercase"
                  placeholder="REL-XXXX-SYNC"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyExchange(null)}
                  className="brutal-btn-secondary px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="brutal-btn px-4 py-2 text-xs uppercase bg-[#86EFAC] disabled:opacity-50"
                >
                  {actionLoading ? "Verifying..." : "Verify & Close Loop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT AUDIT TRAIL MODAL */}
      {selectedExchangeEvents && (
        <div
          onClick={() => setSelectedExchangeEvents(null)}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-black brutal-shadow-lg max-w-lg w-full p-6 relative my-8"
          >
            <button
              onClick={() => setSelectedExchangeEvents(null)}
              className="absolute top-4 right-4 p-1.5 border border-black bg-[#F4F3EC]"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-lg font-black uppercase text-black mb-1">
              Exchange Audit History
            </h2>
            <div className="font-mono text-xs text-gray-600 mb-4">
              PostgreSQL Table: exchange_events for {selectedExchangeEvents.exchange_code}
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {exchangeEvents
                .filter((e) => e.exchange_id === selectedExchangeEvents.id)
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 border-2 border-black bg-[#F4F3EC] font-mono text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-black uppercase">
                        {evt.title}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatDate(evt.created_at)}
                      </span>
                    </div>
                    <div className="text-gray-700 text-xs">
                      {evt.description}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      Actor: <span className="font-bold">{evt.actor_name}</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-4 pt-3 border-t-2 border-black flex justify-end">
              <button
                onClick={() => setSelectedExchangeEvents(null)}
                className="brutal-btn-secondary px-4 py-2 text-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
