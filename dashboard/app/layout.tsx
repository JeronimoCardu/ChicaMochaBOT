import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "ChicaMocha — Pedidos",
  description: "Dashboard de pedidos ChicaMocha",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();` }} />
      </head>
      <body cz-shortcut-listen="true" className="bg-gray-50 dark:bg-[#0a0a0a] min-h-screen">
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
