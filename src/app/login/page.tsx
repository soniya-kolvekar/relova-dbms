"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRelova } from "@/context/RelovaContext";
import { ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useRelova();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid business email address.");
      return;
    }

    setLoading(true);
    const result = await signIn(email);
    setLoading(false);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(
        result.error ||
          "Could not authenticate node. Please check your credentials or register."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3EC] flex flex-col justify-center items-center px-4 py-12">
      {/* Branding */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-[#FDE047] border-2 border-black flex items-center justify-center font-black text-xl">
            R
          </div>
          <span className="font-black text-2xl tracking-wider text-black">
            RELOVA
          </span>
        </Link>
        <div className="font-mono text-xs uppercase font-bold text-gray-600 tracking-widest">
          DBMS OPERATOR GATEWAY
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border-2 border-black brutal-shadow-lg p-6 sm:p-8">
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            Operator Sign In
          </h1>
          <p className="text-xs font-mono text-gray-600 mt-1">
            Access real-time surplus inventory and active exchange transactions.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#F472B6] border-2 border-black font-bold text-xs text-black brutal-shadow-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1.5 text-black">
              Enterprise Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full brutal-input"
              placeholder="e.g. operator@company.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1.5 text-black">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full brutal-input"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full brutal-btn py-3 mt-2 flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
          >
            <span>{loading ? "Authenticating..." : "Sign In & Enter"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 pt-6 border-t-2 border-black text-center text-xs font-mono">
          Don&apos;t have an account registered yet?{" "}
          <Link
            href="/register"
            className="font-bold underline text-black hover:bg-[#FDE047] px-1"
          >
            Register Organization Node
          </Link>
        </div>
      </div>
    </div>
  );
}
