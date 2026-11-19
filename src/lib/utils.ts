import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function getConditionLabel(grade: "A" | "B" | "C" | "D"): string {
  switch (grade) {
    case "A":
      return "Grade A · Like New";
    case "B":
      return "Grade B · Good / Reusable";
    case "C":
      return "Grade C · Usable Surplus";
    case "D":
      return "Grade D · Scrap / Feedstock";
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "available":
    case "open":
      return {
        bg: "bg-[#86EFAC]",
        text: "text-black",
        label: "AVAILABLE",
      };
    case "reserved":
    case "matched":
      return {
        bg: "bg-[#FDE047]",
        text: "text-black",
        label: "MATCHED",
      };
    case "exchanged":
    case "completed":
    case "fulfilled":
      return {
        bg: "bg-[#7DD3FC]",
        text: "text-black",
        label: "COMPLETED",
      };
    case "logistics_scheduled":
      return {
        bg: "bg-[#F472B6]",
        text: "text-black",
        label: "IN TRANSIT",
      };
    default:
      return {
        bg: "bg-gray-200",
        text: "text-black",
        label: status.toUpperCase(),
      };
  }
}
