"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Only show the sidebar on actual application pages
  const isAppRoute = ["/dashboards", "/records", "/donate", "/analytics", "/about"].some(route => pathname.startsWith(route));

  return (
    <div className="flex min-h-screen">
      {isAppRoute && <Sidebar />}
      <div className={`flex-1 flex flex-col min-h-screen ${isAppRoute ? "pt-14 lg:pt-0 lg:pl-52" : ""}`}>
        <main className={`flex-1 flex flex-col ${isAppRoute ? "p-4 sm:p-6 lg:p-8" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
