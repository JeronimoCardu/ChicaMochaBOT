import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChicaMocha — Pedidos",
  description: "Dashboard de pedidos ChicaMocha",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body cz-shortcut-listen="true" className="bg-gray-100 dark:bg-[#0a0a0a] min-h-screen">{children}</body>
    </html>
  );
}
