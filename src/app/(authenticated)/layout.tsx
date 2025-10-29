"use client";

import GNB from "@/components/layout/GNB";
import { usePathname } from "next/navigation";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // 메인페이지에서는 GNB를 렌더링하지 않음 (메인페이지에서 자체적으로 관리)
  const shouldShowGNB = pathname !== "/main";

  return (
    <div className="min-h-screen bg-white">
      {shouldShowGNB && <GNB />}
      {children}
    </div>
  );
}

