import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chica Mocha",
  description: "Chica Mocha — Servicio de pedidos por WhatsApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light');}catch(e){}})();`,
          }}
        />
      </head>
      <body  cz-shortcut-listen="true" className="bg-gray-50 dark:bg-[#0a0a0a] min-h-screen">
        {children}
      </body>
    </html>
  );
}
