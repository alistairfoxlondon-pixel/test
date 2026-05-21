"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { Button } from "@/components/ui/button";

const homeCountries = [
  { value: "united-states", label: "United States" },
  { value: "united-kingdom", label: "United Kingdom" },
  { value: "canada", label: "Canada" },
  { value: "germany", label: "Germany" },
  { value: "australia", label: "Australia" },
];

const destCountries = [
  { value: "spain", label: "Spain" },
  { value: "portugal", label: "Portugal" },
  { value: "united-arab-emirates", label: "United Arab Emirates" },
  { value: "thailand", label: "Thailand" },
  { value: "indonesia", label: "Indonesia" },
];

export default function Home() {
  const router = useRouter();
  const [home, setHome] = useState("united-states");
  const [dest, setDest] = useState("spain");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (home && dest && home !== dest) {
      router.push(`/remote-work-compliance/${home}-to-${dest}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#111827] font-sans">
      {/* Decorative top banner element */}
      <div className="bg-[#1e3a8a] text-white py-16 px-6 text-center shadow-md">
        <div className="max-w-4xl mx-auto">
          <span className="bg-[#3b82f6] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full">
            Regulatory Database
          </span>
          <h1 className="text-4xl font-extrabold mt-4 tracking-tight">
            NomadShield Compliance Engine
          </h1>
          <p className="text-blue-100 mt-2 text-lg max-w-xl mx-auto">
            Verify tax, visa, and corporate legal risks across global migration
            corridors instantly.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto mt-[-32px] px-4 pb-12">
        <form
          onSubmit={handleSearch}
          className="bg-white p-8 rounded-xl shadow-xl border border-gray-100"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                Your Current Tax Home
              </label>
              <select
                value={home}
                onChange={(e) => setHome(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {homeCountries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                Target Destination Country
              </label>
              <select
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {destCountries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-6 rounded-lg shadow-md transition duration-200 uppercase tracking-wider text-sm"
            >
              Generate Compliance Blueprint
            </Button>
          </div>
        </form>

        <AdSlot position="top-banner" />
      </main>
    </div>
  );
}
