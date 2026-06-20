import type { Metadata } from "next";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ShellLayout } from "@/components/providers/ShellLayout";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { ConvCountProvider } from "@/context/ConvCountContext";

export const metadata: Metadata = {
  title: "ChicaMocha — Pedidos",
  description: "Dashboard de pedidos ChicaMocha",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ConvCountProvider>
        <ShellLayout>
          <div className="flex h-dvh overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <MobileHeader />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </div>
        </ShellLayout>
      </ConvCountProvider>
    </ThemeProvider>
  );
}
