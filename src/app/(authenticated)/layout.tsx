"use client";

import GNB from "@/components/layout/GNB";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <GNB />
      {children}
    </div>
  );
}

