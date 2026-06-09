"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  BarChart3,
  Beef,
  Sun,
  Moon,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Pedidos", icon: LayoutDashboard },
  { href: "/dashboard/stock", label: "Stock", icon: Package },
  { href: "/dashboard/conversations", label: "Conversaciones", icon: MessageSquare },
  { href: "/dashboard/analytics", label: "Métricas", icon: BarChart3 },
];

const WA_LINK = "https://wa.me/542325471890";

export function Sidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setIsDark(saved !== "light");
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const html = document.documentElement;
    if (next) {
      html.classList.remove("light");
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <aside className="w-56 shrink-0 border-r border-[#1f1f1f] dark:border-[#1f1f1f] flex flex-col h-screen sticky top-0 bg-white dark:bg-transparent">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1f1f1f] dark:border-[#1f1f1f]">
        <div className="w-7 h-7 rounded-md bg-orange-500/20 flex items-center justify-center">
          <Beef className="w-4 h-4 text-orange-400" />
        </div>
        <span className="font-semibold text-sm text-gray-900 dark:text-white tracking-tight">
          Chicamocha
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/3"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 dark:border-[#1f1f1f] flex items-center gap-2">
        {/* WhatsApp link */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors flex-1 min-w-0"
        >
          <span className="truncate">Jeronimo Cardu</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shrink-0"
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
}
