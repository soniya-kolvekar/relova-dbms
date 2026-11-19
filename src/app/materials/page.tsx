"use client";

import React, { useState, useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import { useRelova } from "@/context/RelovaContext";
import {
  Boxes,
  Search,
  PlusCircle,
  X,
  ExternalLink,
  Trash2,
  Building2,
  Package,
  Scissors,
  Hammer,
  Layers,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ResourceLot } from "@/types";
import { getConditionLabel, getStatusBadge, formatDate } from "@/lib/utils";

// Clean industrial category icon helper (non-AI, purely functional)
function getCategoryIcon(code: string) {
  const c = (code || "").toUpperCase();
  if (c.includes("PACK")) return <Package className="w-6 h-6 text-black" />;
  if (c.includes("TEXT")) return <Scissors className="w-6 h-6 text-black" />;
  if (c.includes("TIMB") || c.includes("WOOD")) return <Hammer className="w-6 h-6 text-black" />;
  if (c.includes("POLY") || c.includes("PLAST")) return <Layers className="w-6 h-6 text-black" />;
  return <Boxes className="w-6 h-6 text-black" />;
}

export default function MaterialsPage() {
  const { lots, categories, currentUser, deleteLot } = useRelova();

  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedLot, setSelectedLot] = useState<ResourceLot | null>(null);

  // Filtered lots
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      // Tab filter
      if (activeTab === "my" && currentUser && lot.user_id !== currentUser.id) {
        return false;
      }
      // Search
      if (
        searchTerm &&
        !lot.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !lot.material_type.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !lot.lot_code.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      // Category
      if (selectedCategory !== "all" && lot.category_id !== selectedCategory) {
        return false;
      }
      // Condition
      if (selectedCondition !== "all" && lot.grade !== selectedCondition) {
        return false;
      }
      // Status
      if (selectedStatus !== "all" && lot.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [
    lots,
    activeTab,
    currentUser,
    searchTerm,
    selectedCategory,
    selectedCondition,
    selectedStatus,
  ]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this surplus lot?")) {
      await deleteLot(id);
      if (selectedLot?.id === id) setSelectedLot(null);
    }
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-black tracking-tight">
            Surplus Material Inventory
          </h1>
          <p className="text-xs font-mono text-gray-600 mt-1">
            Real-time feed directly from PostgreSQL database table:{" "}
            <span className="font-bold text-black">resource_lots</span>
          </p>
        </div>

        <Link
          href="/post-material"
          className="brutal-btn px-4 py-2 text-xs flex items-center gap-2 uppercase w-fit"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Surplus Lot</span>
        </Link>
      </div>

      {/* Tabs: All Materials vs My Node's Listings */}
      <div className="flex border-b-2 border-black mb-6 gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 font-mono text-xs font-black uppercase transition-all ${
            activeTab === "all"
              ? "bg-white border-t-2 border-x-2 border-black translate-y-[2px]"
              : "text-gray-600 hover:text-black"
          }`}
        >
          All Available Surplus ({lots.length})
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`px-4 py-2 font-mono text-xs font-black uppercase transition-all ${
            activeTab === "my"
              ? "bg-[#FDE047] border-t-2 border-x-2 border-black translate-y-[2px]"
              : "text-gray-600 hover:text-black"
          }`}
        >
          My Listings ({currentUser ? lots.filter((l) => l.user_id === currentUser.id).length : 0})
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-2 border-black brutal-shadow-sm p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search material title or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full brutal-input pl-9 text-xs"
          />
        </div>

        {/* Category */}
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

        {/* Condition Grade */}
        <div>
          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="w-full brutal-input text-xs font-mono"
          >
            <option value="all">All Condition Grades</option>
            <option value="A">Grade A (Like New / Overrun)</option>
            <option value="B">Grade B (Good / Reusable)</option>
            <option value="C">Grade C (Surplus)</option>
            <option value="D">Grade D (Scrap / Regrind)</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full brutal-input text-xs font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved / Matched</option>
            <option value="exchanged">Exchanged / Completed</option>
          </select>
        </div>
      </div>

      {/* Material Lots Cards Grid */}
      {filteredLots.length === 0 ? (
        <div className="bg-white border-2 border-black brutal-shadow p-12 text-center font-mono">
          <Boxes className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="font-bold text-sm text-black uppercase">
            No surplus lots found in database
          </div>
          <div className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {lots.length === 0
              ? "Your inventory is currently empty. Click 'Post Surplus Lot' above to publish the first material to PostgreSQL!"
              : "No listings match the current filters."}
          </div>
          {lots.length === 0 && (
            <Link
              href="/post-material"
              className="brutal-btn px-4 py-2 text-xs uppercase inline-flex items-center gap-2 mt-4"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Your First Lot</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot) => {
            const badge = getStatusBadge(lot.status);
            const isOwner = currentUser && lot.user_id === currentUser.id;

            return (
              <div
                key={lot.id}
                onClick={() => setSelectedLot(lot)}
                className="bg-white border-2 border-black brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Category Header Card with Non-AI Clean Icon */}
                  <div className="p-4 bg-[#F4F3EC] border-b-2 border-black flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-2 border-black bg-[#FDE047] flex items-center justify-center brutal-shadow-sm">
                        {getCategoryIcon(lot.category_name)}
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-gray-500 font-bold uppercase">
                          {lot.category_name}
                        </div>
                        <div className="font-mono text-xs font-black text-black">
                          {lot.lot_code}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`brutal-badge ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {isOwner && (
                        <span className="brutal-badge bg-[#FDE047]">
                          MY LOT
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="font-black text-base text-black line-clamp-1">
                      {lot.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {lot.description || "Industrial surplus material registered for circular reuse loop."}
                    </p>

                    {/* Technical Specs */}
                    <div className="mt-4 pt-3 border-t-2 border-dashed border-gray-300 grid grid-cols-2 gap-2 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block">
                          QUANTITY
                        </span>
                        <span className="font-bold text-black">
                          {Number(lot.quantity).toLocaleString()} {lot.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">
                          CONDITION
                        </span>
                        <span className="font-bold text-black">
                          Grade {lot.grade}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-3 bg-[#F4F3EC] border-t-2 border-black flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 truncate text-gray-700">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{lot.organization || "Relova Node"}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isOwner && lot.status === "available" && (
                      <button
                        onClick={(e) => handleDelete(lot.id, e)}
                        className="p-1 border border-black bg-white hover:bg-[#F472B6] transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-black" />
                      </button>
                    )}
                    <span className="font-bold underline text-black">
                      Details →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lot Detail Modal */}
      {selectedLot && (
        <div
          onClick={() => setSelectedLot(null)}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-2 border-black brutal-shadow-lg max-w-xl w-full p-6 relative my-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedLot(null)}
              className="absolute top-4 right-4 p-1.5 border-2 border-black bg-[#F4F3EC] hover:bg-[#FDE047] font-bold"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="brutal-badge bg-[#FDE047]">
                {selectedLot.lot_code}
              </span>
              <span className={`brutal-badge ${getStatusBadge(selectedLot.status).bg}`}>
                {getStatusBadge(selectedLot.status).label}
              </span>
              <span className="font-mono text-xs text-gray-500">
                {selectedLot.category_name}
              </span>
            </div>

            <h2 className="text-2xl font-black uppercase text-black mb-4">
              {selectedLot.title}
            </h2>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F4F3EC] border-2 border-black p-3 font-mono text-xs mb-4">
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">
                  Material Chemistry
                </span>
                <span className="font-bold text-black">
                  {selectedLot.material_type}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">
                  Condition Grade
                </span>
                <span className="font-bold text-black">
                  {getConditionLabel(selectedLot.grade)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">
                  Quantity
                </span>
                <span className="font-bold text-black">
                  {Number(selectedLot.quantity).toLocaleString()} {selectedLot.unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase block">
                  Unit Price
                </span>
                <span className="font-bold text-black">
                  {selectedLot.price_per_unit === 0
                    ? "Free Donation"
                    : `₹${selectedLot.price_per_unit} / ${selectedLot.unit}`}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <h4 className="font-mono text-xs font-bold uppercase text-gray-700 mb-1">
                Material Description &amp; Handling Notes
              </h4>
              <p className="text-sm text-gray-800 leading-relaxed bg-gray-50 p-3 border border-black font-mono text-xs">
                {selectedLot.description || "No special handling instructions specified."}
              </p>
            </div>

            {/* Logistics & Location */}
            <div className="border-t-2 border-black pt-3 flex flex-col sm:flex-row justify-between text-xs font-mono text-gray-700 gap-2">
              <div>
                <div>
                  Provider: <span className="font-bold text-black">{selectedLot.provider_name}</span> (
                  {selectedLot.organization})
                </div>
                <div>
                  Storage Bay: <span className="font-bold">{selectedLot.storage_bay || "Main Staging Dock"}</span>
                </div>
              </div>
              <div className="text-right">
                Published: {formatDate(selectedLot.created_at)}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLot(null)}
                className="brutal-btn-secondary px-4 py-2 text-xs uppercase"
              >
                Close
              </button>
              <Link
                href="/exchanges"
                className="brutal-btn px-4 py-2 text-xs uppercase flex items-center gap-1.5"
              >
                <span>Check Matches</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
