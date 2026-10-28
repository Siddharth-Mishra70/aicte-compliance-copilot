import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { ComplianceProvider } from "@/context/ComplianceContext";

export const metadata: Metadata = {
  title: "AICTE Institutional Data Quality & Compliance Copilot",
  description:
    "Intelligent compliance management, deficit detection, and Approval Process Handbook Copilot for AICTE institutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="flex h-screen overflow-hidden bg-zinc-950 font-sans text-slate-100">
        <ComplianceProvider>
          <div className="flex h-full w-full overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="mx-auto max-w-7xl">{children}</div>
              </main>
            </div>
          </div>
        </ComplianceProvider>
      </body>
    </html>
  );
}
