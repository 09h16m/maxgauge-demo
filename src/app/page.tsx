"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hero } from "@/components/ui/animated-hero";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/main");
  };

  return (
    <div className="relative min-h-screen flex">
      {/* 왼쪽: 배경 영역 */}
      <div className="flex-1 relative bg-black">
      </div>

      {/* 오른쪽: 로그인 폼 영역 */}
      <div className="w-full  md:w-1/2 lg:w-1/3 bg-white flex items-center justify-center bg-white/90 border-white backdrop-blur-sm flex flex-col gap-6 border py-6 shadow-sm">
        <div className="w-3/5 h-full flex items-center justify-center">
          <div className="w-full">

              <div className="text-center mb-10 pt-6">
                <Hero />
              </div>
              <div className="px-6 py-24 space-y-4 pt-1">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-800">User ID</label>
                  <Input 
                    placeholder="ID" 
                    className="bg-gray-100 border-gray-200 text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-800">Password</label>
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    className="bg-gray-100 border-gray-200 text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1 bg-gray-800 text-white hover:bg-gray-700"
                    onClick={handleLogin}
                  >
                    로그인
                  </Button>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
