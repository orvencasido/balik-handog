"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "./components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <title>Balik Handog | St. Ferdinand Cathedral</title>
      </head>
      <body className="h-full bg-background flex text-foreground">
        {!isLoginPage && <Sidebar />}
        <div className={`flex-1 flex flex-col min-h-screen ${!isLoginPage ? "pt-14 lg:pt-0 lg:pl-52" : ""}`}>
          <main className={`flex-1 flex flex-col ${!isLoginPage ? "p-4 sm:p-6 lg:p-8" : ""}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
