"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, HelpCircle, Search, Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface GNBProps {
  variant?: "with-border" | "without-border";
}

export default function GNB({ variant = "with-border" }: GNBProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push("/");
  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/maxgauge-ai", label: "MaxGauge AI" },
    { href: "/root-finder", label: "Root Finder" },
    { href: "/oracle", label: "Oracle" },
    { href: "/tools", label: "Tools" },
  ];

  return (
    <nav className={`bg-white relative z-20 ${variant === "with-border" ? "border-b border-gray-200" : ""}`}>
      <div className="flex items-center justify-between px-8 h-14">
        {/* 왼쪽 영역: 로고 + 메뉴 */}
        <div className="flex items-center gap-6 h-14 flex-1">
          {/* 로고 */}
          <Link href="/main" className="flex items-center cursor-pointer">
            <img 
              src="/logos/exem-logo.svg" 
              alt="EXEM Logo" 
              className="w-7 h-7"
            />
          </Link>

          {/* 메뉴 그룹 */}
          <div className="flex items-center gap-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-[#030712]"
                      : "text-[#030712] hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 중앙 영역: 검색 필드 */}
        <div className="flex-1 flex items-center px-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder='Try searching "Parameter"'
              className="w-full h-10 pl-10 pr-4 text-sm bg-[#f3f4f6] border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-[#6a7282]"
            />
          </div>
        </div>

        {/* 오른쪽 영역: 버전 + 알림 + 아바타 */}
        <div className="flex items-center justify-end gap-4 h-14 flex-1">
          {/* 버전 텍스트 */}
          <span className="text-sm text-gray-600">MaxGauge Demo 6.1.261105</span>
          
          {/* 알림 버튼 */}
          <button className="w-8 h-8 flex items-center justify-center bg-[#f3f4f6] rounded-full hover:bg-gray-200 transition-colors">
            <Bell className="w-4 h-4 text-gray-700" />
          </button>

          {/* 아바타 드롭다운 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-full bg-[#99a1af] flex items-center justify-center text-white text-lg font-semibold hover:bg-gray-500 transition-colors cursor-pointer">
                M
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}

