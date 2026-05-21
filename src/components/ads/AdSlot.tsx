import React from "react";

type AdSlotProps = {
  position: "top-banner" | "in-content" | "sidebar" | "footer";
};

export function AdSlot({ position }: AdSlotProps) {
  // In the future, this component will load Google AdSense via env variables
  // e.g. if (!process.env.NEXT_PUBLIC_ADSENSE_ID) return null;

  const styles = {
    "top-banner": "w-full min-h-[90px] mt-8 mb-4",
    "in-content": "w-full min-h-[250px] my-8",
    "sidebar": "w-full min-h-[600px] mb-8",
    "footer": "w-full min-h-[90px] mt-12",
  };

  return (
    <div
      className={`bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 tracking-widest rounded-lg ${styles[position]}`}
      aria-hidden="true"
    >
      ADVERTISEMENT CONTROLLER CONTAINER ({position.toUpperCase()} AUTO-ADS TARGET ZONE)
    </div>
  );
}
