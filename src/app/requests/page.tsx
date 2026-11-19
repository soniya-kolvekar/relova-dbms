"use client";

import React, { useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import { useRelova } from "@/context/RelovaContext";
import {
  FileQuestion,
  PlusCircle,
  Search,
  Building2,
  X,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { DemandRequest, ConditionGrade } from "@/types";
import { getConditionLabel, getStatusBadge, formatDate } from "@/lib/utils";

export default function RequestsPage() {
  const { requests, categories, currentUser, createRequest } = useRelova();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DemandRequest | null>(
    null
  );

  // New Request Form State
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [materialType, setMaterialType] = useState("");
  const [quantityNeeded, setQuantityNeeded] = useState<number | "">("");
  const [unit, setUnit] = useState("kg");
  const [minCondition, setMinCondition] = useState<ConditionGrade>("B");
  const [urgency, setUrgency] = useState<
    "Low" | "Medium" | "High" | "Immediate"
  >("Medium");
  const [intendedPurpose, setIntendedPurpose] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Filtering
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (
        searchTerm &&
        !r.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.material_type.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.request_code.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (selectedCategory !== "all" && r.category_id !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== "all" && r.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [requests, searchTerm, selectedCategory, selectedStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Please enter a demand title.");
      return;
    }
    if (!materialType.trim()) {
      setFormError("Please specify the material type.");
      return;
    }
    if (!quantityNeeded || Number(quantityNeeded) <= 0) {
      setFormError("Quantity must be greater than zero.");
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);

    setLoading(true);
    const result = await createRequest({
      title: title.trim(),
      category_id: categoryId || categories[0]?.id,
      category_name: cat ? cat.name : "Packaging & Logistics",
      material_type: materialType.trim(),
      quantity_needed: Number(quantityNeeded),
      unit,
      min_condition: minCondition,
      urgency,
      intended_purpose: intendedPurpose.trim(),
      recipient_name: currentUser?.full_name || "Enterprise Operator",
      organization: currentUser?.organization || "Relova Regional Hub",
      user_id: currentUser?.id,
    });
    setLoading(false);

    if (result.success) {
      setFormSuccess(true);
      setTimeout(() => {
        setShowCreateModal(false);
        setFormSuccess(false);
        setTitle("");
        setMaterialType("");
        setQuantityNeeded("");
        setIntendedPurpose("");
      }, 700);
    } else {
      setFormError(result.error || "Failed to insert into demand_requests table.");
    }
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-black tracking-tight">
            Demand Radar &amp; Requirements
          </h1>
          <p className="text-xs font-mono text-gray-600 mt-1">
            Real-time feed directly from PostgreSQL database table:{" "}
            <span className="font-bold text-black">demand_requests</span>
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="brutal-btn px-4 py-2 text-xs flex items-center gap-2 uppercase w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Demand Spec</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border-2 border-black brutal-shadow-sm p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search demand requirements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full brutal-input pl-9 text-xs"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full brutal-input text-xs font-mono"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full brutal-input text-xs font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open (Seeking Material)</option>
            <option value="matched">Matched</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border-2 border-black brutal-shadow p-12 text-center font-mono">
          <FileQuestion className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="font-bold text-sm text-black uppercase">
            No demand requests found in database
          </div>
          <div className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {requests.length === 0
              ? "No material requirements registered yet. Click 'Post Demand Spec' to register what raw materials your workshop needs!"
              : "No requirements match the active filters."}
          </div>
          {requests.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="brutal-btn px-4 py-2 text-xs uppercase inline-flex items-center gap-2 mt-4"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Demand Spec</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => {
            const badge = getStatusBadge(req.status);
            const isOwner = currentUser && req.user_id === currentUser.id;

            return (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="bg-white border-2 border-black brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`brutal-badge ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {isOwner && (
                        <span className="brutal-badge bg-[#FDE047]">
                          MY DEMAND
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-gray-500 font-bold">
                      {req.request_code}
                    </span>
                  </div>

                  <div className="font-mono text-[11px] text-gray-600 font-bold uppercase mb-1">
                    {req.category_name}
                  </div>

                  <h3 className="font-black text-base text-black line-clamp-2">
                    {req.title}
                  </h3>

                  <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                    Purpose: {req.intended_purpose || "Circular production feedstock requirement."}
                  </p>

                  {/* Specs Box */}
                  <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300 grid grid-cols-2 gap-2 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 block">
                        REQUIRED
                      </span>
                      <span className="font-bold text-black">
                        {Number(req.quantity_needed).toLocaleString()} {req.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-500 block">
                        URGENCY
                      </span>
                      <span className="font-bold text-black">
                        {req.urgency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t-2 border-black flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 truncate text-gray-700">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{req.organization || "Relova Node"}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 font-bold text-black underline">
                    <span>Inspect →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Demand Detail Modal */}
      {selectedRequest && (
        <div
          onClick={() => setSelectedRequest(null)}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-black brutal-shadow-lg max-w-xl w-full p-6 relative my-8"
          >
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 p-1.5 border-2 border-black bg-[#F4F3EC] hover:bg-[#FDE047] font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="brutal-badge bg-[#FDE047]">
                {selectedRequest.request_code}
              </span>
              <span className={`brutal-badge ${getStatusBadge(selectedRequest.status).bg}`}>
                {getStatusBadge(selectedRequest.status).label}
              </span>
              <span className="font-mono text-xs text-gray-500">
                {selectedRequest.category_name}
              </span>
            </div>

            <h2 className="text-xl font-black uppercase text-black mb-4">
              {selectedRequest.title}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F4F3EC] border-2 border-black p-3 font-mono text-xs mb-4">
              <div>
                <span className="text-[10px] text-gray-500 block">MATERIAL</span>
                <span className="font-bold text-black">
                  {selectedRequest.material_type}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">NEEDED</span>
                <span className="font-bold text-black">
                  {Number(selectedRequest.quantity_needed).toLocaleString()} {selectedRequest.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">MIN GRADE</span>
                <span className="font-bold text-black">
                  Grade {selectedRequest.min_condition}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">URGENCY</span>
                <span className="font-bold text-black">
                  {selectedRequest.urgency}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-mono text-xs font-bold uppercase text-gray-700 mb-1">
                Intended Application / Circular Loop Purpose
              </h4>
              <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 border border-black font-mono text-xs">
                {selectedRequest.intended_purpose || "No special description provided."}
              </p>
            </div>

            <div className="border-t-2 border-black pt-3 flex justify-between text-xs font-mono text-gray-700">
              <div>
                Recipient: <span className="font-bold text-black">{selectedRequest.recipient_name}</span> (
                {selectedRequest.organization})
              </div>
              <div>Posted: {formatDate(selectedRequest.created_at)}</div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedRequest(null)}
                className="brutal-btn-secondary px-4 py-2 text-xs uppercase"
              >
                Close
              </button>
              <Link
                href="/exchanges"
                className="brutal-btn px-4 py-2 text-xs uppercase flex items-center gap-1.5"
              >
                <span>View Matches</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-black brutal-shadow-lg max-w-lg w-full p-6 relative my-8"
          >
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 border-2 border-black bg-[#F4F3EC] hover:bg-[#FDE047] font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-black uppercase text-black mb-1">
              Post Material Demand Spec
            </h2>
            <p className="text-xs font-mono text-gray-600 mb-4">
              Inserts requirement record into PostgreSQL table:{" "}
              <span className="font-bold text-black">demand_requests</span>
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-[#F472B6] border-2 border-black font-bold text-xs text-black">
                ⚠ {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 bg-[#86EFAC] border-2 border-black font-bold text-xs text-black flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Demand inserted into database! Autononous match trigger executed.
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Demand Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full brutal-input text-xs"
                  placeholder="e.g. Clean Corrugated Boxes for Organic Produce"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full brutal-input font-mono text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                    Material Chemistry *
                  </label>
                  <input
                    type="text"
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full brutal-input text-xs"
                    placeholder="e.g. Kraft Paper / HDPE / Fir"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                    Quantity Needed *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={quantityNeeded}
                    onChange={(e) =>
                      setQuantityNeeded(
                        e.target.value === "" ? "" : parseFloat(e.target.value)
                      )
                    }
                    className="w-full brutal-input text-xs"
                    placeholder="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                    Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full brutal-input font-mono text-xs"
                  >
                    <option value="kg">kg</option>
                    <option value="tonnes">Tonnes</option>
                    <option value="litres">Litres</option>
                    <option value="units">Units</option>
                    <option value="pallets">Pallets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                    Min Condition
                  </label>
                  <select
                    value={minCondition}
                    onChange={(e) =>
                      setMinCondition(e.target.value as ConditionGrade)
                    }
                    className="w-full brutal-input font-mono text-xs"
                  >
                    <option value="A">Grade A</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                    <option value="D">Grade D</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Urgency Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Low", "Medium", "High", "Immediate"] as const).map(
                    (lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setUrgency(lvl)}
                        className={`py-1.5 border-2 border-black font-mono text-xs font-bold uppercase ${
                          urgency === lvl
                            ? "bg-[#FDE047] brutal-shadow-sm"
                            : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        {lvl}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Intended Application / Circular Loop Purpose
                </label>
                <textarea
                  rows={2}
                  value={intendedPurpose}
                  onChange={(e) => setIntendedPurpose(e.target.value)}
                  className="w-full brutal-input text-xs"
                  placeholder="Describe circular remanufacturing application..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="brutal-btn-secondary px-4 py-2 text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="brutal-btn px-5 py-2 text-xs uppercase disabled:opacity-50"
                >
                  {loading ? "Inserting to PostgreSQL..." : "Publish to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
