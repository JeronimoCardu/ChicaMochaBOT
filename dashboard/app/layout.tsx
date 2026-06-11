import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ShellLayout } from "@/components/providers/ShellLayout";
import { MobileHeader } from "@/components/dashboard/MobileHeader";

export const metadata: Metadata = {
  title: "ChicaMocha — Pedidos",
  description: "Dashboard de pedidos ChicaMocha",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();` }} />
      </head>
      <body cz-shortcut-listen="true" className="bg-gray-50 dark:bg-[#0a0a0a] min-h-screen">
        <ThemeProvider>
          <ShellLayout>
            <div className="flex h-dvh overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <MobileHeader />
                <main className="flex-1 overflow-y-auto">{children}</main>
              </div>
            </div>
          </ShellLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
