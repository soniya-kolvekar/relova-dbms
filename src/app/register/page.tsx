"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRelova } from "@/context/RelovaContext";
import { ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useRelova();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please provide an operator full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid work email address.");
      return;
    }
    if (!organization.trim()) {
      setError("Please provide an organization or workshop name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await signUp(fullName, email, organization);
    setLoading(false);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Failed to register in database.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3EC] flex flex-col justify-center items-center px-4 py-12">
      {/* Branding */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-[#FDE047] border-2 border-black flex items-center justify-center font-black text-xl">
            R
          </div>
          <span className="font-black text-2xl tracking-wider text-black">
            RELOVA
          </span>
        </Link>
        <div className="font-mono text-xs uppercase font-bold text-gray-600 tracking-widest">
          ORGANIZATION ONBOARDING GATEWAY
        </div>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-lg bg-white border-2 border-black brutal-shadow-lg p-6 sm:p-8">
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Register Organization Node
          </h1>
          <p className="text-xs font-mono text-gray-600 mt-1">
            Create your operator account on the PostgreSQL circular material network.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#F472B6] border-2 border-black font-bold text-xs text-black brutal-shadow-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                Operator Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full brutal-input"
                placeholder="e.g. Ramesh Patel"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
                Work Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full brutal-input"
                placeholder="ramesh@apexlabs.in"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
              Legal Organization / Facility Name *
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full brutal-input"
              placeholder="e.g. Apex Precision Bio-Tech Labs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1 text-black">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full brutal-input"
              placeholder="At least 6 characters"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full brutal-btn py-3 mt-4 flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
          >
            <span>{loading ? "Registering in PostgreSQL..." : "Register & Launch Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t-2 border-black text-center text-xs font-mono">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-bold underline text-black hover:bg-[#FDE047] px-1"
          >
            Sign In to Node
          </Link>
        </div>
      </div>
    </div>
  );
}
