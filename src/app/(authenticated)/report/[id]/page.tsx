"use client";

interface ReportPageProps {
  params: {
    id: string;
  };
}

export default function ReportPage({ params }: ReportPageProps) {
  return (
    <div className="h-[calc(100vh-56px)] bg-white flex items-center justify-center">
      <h1 className="text-2xl font-medium text-gray-900">보고서 페이지</h1>
    </div>
  );
}

