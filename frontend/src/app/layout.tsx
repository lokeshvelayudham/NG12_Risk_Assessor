import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter for a cleaner look
import "./globals.css";
import { MobileSidebar, Sidebar } from "@/components/Sidebar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NG12 Cancer Risk Assessor",
  description: "AI-powered clinical decision support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-background">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 border-r bg-background fixed inset-y-0 z-50">
             <Suspense fallback={<div className="w-64 border-r bg-background h-full" />}>
                <Sidebar className="h-full border-r" />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:pl-64 flex flex-col">
            {/* Mobile Header */}
            <header className="h-14 lg:hidden border-b bg-background flex items-center px-4 sticky top-0 z-40">
              <MobileSidebar />
              <div className="font-semibold text-lg">NG12 Risk Assessor</div>
            </header>
            
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
