"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useRelova } from "@/context/RelovaContext";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  Boxes,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { ConditionGrade } from "@/types";

export default function PostMaterialPage() {
  const router = useRouter();
  const { categories, createLot, currentUser } = useRelova();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [materialType, setMaterialType] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [unit, setUnit] = useState("kg");
  const [grade, setGrade] = useState<ConditionGrade>("A");
  const [pricePerUnit, setPricePerUnit] = useState<number | "">(0);
  const [storageBay, setStorageBay] = useState("Bay 1 Staging Yard");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please provide a descriptive title for this surplus lot.");
      return;
    }
    if (!materialType.trim()) {
      setError("Please specify the technical or primary material type.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Available quantity must be greater than zero.");
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);

    setLoading(true);
    const result = await createLot({
      title: title.trim(),
      category_id: categoryId || categories[0]?.id,
      category_name: cat ? cat.name : "Packaging & Logistics",
      material_type: materialType.trim(),
      description: description.trim(),
      quantity: Number(quantity),
      unit,
      grade,
      price_per_unit: pricePerUnit === "" ? 0 : Number(pricePerUnit),
      storage_bay: storageBay.trim(),
      provider_name: currentUser?.full_name || "Enterprise Operator",
      organization: currentUser?.organization || "Relova Regional Hub",
      user_id: currentUser?.id,
    });
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/materials");
      }, 700);
    } else {
      setError(result.error || "Failed to insert record into resource_lots table.");
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="brutal-badge bg-[#FDE047]">
              POSTGRESQL INSERT MANIFEST
            </span>
            <span className="font-mono text-xs text-gray-500 font-bold">
              OPERATING AS: {currentUser?.organization || "Standard Node"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase text-black tracking-tight">
            Publish Surplus Material Lot
          </h1>
          <p className="text-xs font-mono text-gray-600 mt-1">
            Registers surplus material directly into the PostgreSQL{" "}
            <span className="font-bold text-black">resource_lots</span> table.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#F472B6] border-2 border-black font-bold text-xs text-black brutal-shadow-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-[#86EFAC] border-2 border-black font-bold text-xs text-black brutal-shadow-sm flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>
              Lot inserted into database table successfully! Redirecting to inventory...
            </span>
          </div>
        )}

        {/* Post Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-2 border-black brutal-shadow p-6 md:p-8 space-y-6"
        >
          {/* Section 1: Classification */}
          <div>
            <h3 className="font-mono text-xs font-black uppercase text-black border-b-2 border-black pb-1 mb-4 flex items-center gap-2">
              <Boxes className="w-4 h-4" />
              <span>1. Material Specification &amp; Classification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Listing Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full brutal-input"
                  placeholder="e.g. Single-Stream Clean HDPE Regrind"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Material Category *
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
                  Material Chemistry / Composition *
                </label>
                <input
                  type="text"
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full brutal-input"
                  placeholder="e.g. HDPE Flake / Kraft Corrugated / Fir"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Condition Grade *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as ConditionGrade)}
                  className="w-full brutal-input font-mono text-xs"
                >
                  <option value="A">Grade A (Like New / Overrun)</option>
                  <option value="B">Grade B (Good / Reusable)</option>
                  <option value="C">Grade C (Usable Surplus)</option>
                  <option value="D">Grade D (Scrap / Regrind Feedstock)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Quantity, Staging & Valuation */}
          <div>
            <h3 className="font-mono text-xs font-black uppercase text-black border-b-2 border-black pb-1 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>2. Quantity, Storage Bay &amp; Price</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Available Quantity *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value === "" ? "" : parseFloat(e.target.value)
                    )
                  }
                  className="w-full brutal-input"
                  placeholder="e.g. 250"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Unit of Measure *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full brutal-input font-mono text-xs"
                >
                  <option value="kg">kg (Kilograms)</option>
                  <option value="tonnes">Tonnes</option>
                  <option value="litres">Litres</option>
                  <option value="units">Units / Pieces</option>
                  <option value="pallets">Pallets</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Price per Unit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pricePerUnit}
                  onChange={(e) =>
                    setPricePerUnit(
                      e.target.value === "" ? "" : parseFloat(e.target.value)
                    )
                  }
                  className="w-full brutal-input"
                  placeholder="0 for Free Donation"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Facility Storage Bay Location
                </label>
                <input
                  type="text"
                  value={storageBay}
                  onChange={(e) => setStorageBay(e.target.value)}
                  className="w-full brutal-input"
                  placeholder="e.g. Bay 2, North Dock"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                  Material Description &amp; Handling Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full brutal-input"
                  placeholder="Describe material purity, dimensions, storage conditions..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t-2 border-black flex items-center justify-end gap-3">
            <Link
              href="/materials"
              className="brutal-btn-secondary px-5 py-2.5 text-xs uppercase font-bold"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="brutal-btn px-6 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Inserting to PostgreSQL..." : "Publish to Database"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
