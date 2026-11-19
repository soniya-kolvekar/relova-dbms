"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  PlusCircle,
  FileQuestion,
  ArrowLeftRight,
  Database,
  Leaf,
} from "lucide-react";
import { useRelova } from "@/context/RelovaContext";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badgeKey: null,
  },
  {
    name: "Materials",
    href: "/materials",
    icon: Boxes,
    badgeKey: "lots",
  },
  {
    name: "Post Material",
    href: "/post-material",
    icon: PlusCircle,
    badgeKey: null,
  },
  {
    name: "Requests",
    href: "/requests",
    icon: FileQuestion,
    badgeKey: "requests",
  },
  {
    name: "Exchanges",
    href: "/exchanges",
    icon: ArrowLeftRight,
    badgeKey: "exchanges",
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { lots, requests, exchanges, matches, environmentalStats } = useRelova();

  const getBadgeCount = (key: string | null) => {
    if (key === "lots") return lots.filter((l) => l.status === "available").length;
    if (key === "requests") return requests.filter((r) => r.status === "open").length;
    if (key === "exchanges") return exchanges.length + matches.filter((m) => m.status === "suggested").length;
    return null;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#ffffff] border-r-2 border-black flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="h-16 border-b-2 border-black flex items-center px-4 bg-[#FDE047]">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-black" />
              <span className="font-mono text-xs font-black tracking-wider uppercase">
                CIRCULAR NODE · 8 TABLES
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const count = getBadgeCount(item.badgeKey);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 border-2 border-black font-bold text-sm transition-all ${
                    isActive
                      ? "bg-[#FDE047] brutal-shadow translate-x-[2px] translate-y-[2px]"
                      : "bg-[#ffffff] hover:bg-[#F4F3EC] brutal-shadow-sm hover:translate-x-[1px] hover:translate-y-[1px]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-black" />
                    <span className="tracking-wide text-black">{item.name}</span>
                  </div>
                  {count !== null && (
                    <span className="font-mono text-[10px] bg-black text-white px-1.5 py-0.2 rounded-none font-bold">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Environmental Impact Mini Badge */}
        <div className="p-3 m-3 bg-[#86EFAC] border-2 border-black brutal-shadow-sm">
          <div className="flex items-center gap-2 mb-1.5">
            <Leaf className="w-4 h-4 text-black" />
            <span className="font-mono text-[10px] font-black uppercase text-black tracking-wider">
              REAL-TIME ESG DIVERSION
            </span>
          </div>
          <div className="space-y-1 font-mono text-xs text-black">
            <div className="flex justify-between">
              <span className="text-gray-700">Diverted:</span>
              <span className="font-bold">{environmentalStats.total_diverted_kg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Avoided CO₂:</span>
              <span className="font-bold">{environmentalStats.total_co2e_saved_kg} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Loops Settled:</span>
              <span className="font-bold">{environmentalStats.completed_exchanges_count}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
