"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRelova } from "@/context/RelovaContext";
import { Layers, LogOut, Database, UserCheck } from "lucide-react";

export default function Navbar({
  onMenuToggle,
}: {
  onMenuToggle?: () => void;
}) {
  const router = useRouter();
  const { currentUser, signOut, dbConnected } = useRelova();

  const handleLogout = () => {
    signOut();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-[#ffffff] border-b-2 border-black px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile trigger & App branding */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 border-2 border-black bg-[#FDE047] brutal-shadow-sm font-bold"
            aria-label="Toggle Navigation"
          >
            <Layers className="w-5 h-5 text-black" />
          </button>
        )}

        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#FDE047] border-2 border-black flex items-center justify-center font-black text-black group-hover:bg-[#86EFAC] transition-colors">
            R
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-wider text-black leading-none">
              RELOVA
            </span>
            <span className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none mt-0.5">
              DBMS DUAL PORTAL
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Operator Profile & Sign Out */}
      <div className="flex items-center gap-3">
        {/* Supabase Database Connection Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 border-2 border-black bg-[#F4F3EC] font-mono text-[11px] font-bold">
          <span
            className={`w-2 h-2 rounded-full ${
              dbConnected ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <span>{dbConnected ? "POSTGRESQL LIVE" : "SUPABASE CONNECTED"}</span>
        </div>

        {currentUser ? (
          <div className="flex items-center gap-2">
            <div className="border-2 border-black bg-white px-3 py-1 flex items-center gap-2 brutal-shadow-sm">
              <div className="w-6 h-6 bg-[#86EFAC] border border-black flex items-center justify-center text-xs font-black text-black">
                {currentUser.full_name ? currentUser.full_name[0].toUpperCase() : "U"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold leading-tight text-black line-clamp-1">
                  {currentUser.full_name}
                </span>
                <span className="font-mono text-[10px] text-gray-600 leading-tight line-clamp-1">
                  {currentUser.organization}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 border-2 border-black bg-[#F4F3EC] hover:bg-[#FDE047] font-bold text-xs transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-black" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1 border-2 border-black bg-white hover:bg-gray-100 font-bold text-xs"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 py-1 border-2 border-black bg-[#FDE047] font-bold text-xs"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
