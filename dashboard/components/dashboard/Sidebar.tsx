"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquare, Package, BarChart3, Sun, Moon, ExternalLink, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useSidebar } from "@/components/providers/ShellLayout";
import { useConvCounts } from "@/context/ConvCountContext";

const NAV = [
  { href: "/",              label: "Pedidos",        icon: LayoutDashboard },
  { href: "/stock",         label: "Stock",          icon: Package         },
  { href: "/conversations", label: "Conversaciones", icon: MessageSquare   },
  { href: "/analytics",     label: "Métricas",       icon: BarChart3       },
];

const WA_LINK = "https://wa.me/542325471890";

export function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { isOpen, close } = useSidebar();
  const { humanRequested, humanActive } = useConvCounts();
  const isDark = theme === "dark";

  async function handleLogout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col h-full bg-white dark:bg-[#0d0d0d]",
          "border-r border-gray-200 dark:border-[#1f1f1f]",
          // Mobile: fixed overlay, slide in/out
          "fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: in-flow, always visible
          "md:relative md:translate-x-0 md:w-56 md:transition-none md:shrink-0"
        )}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200 dark:border-[#1f1f1f] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-orange-500/20 flex items-center justify-center">
              <Image src="/logo.png" alt="Chicamocha" width={32} height={32} />
            </div>
            <span className="font-semibold text-sm text-gray-900 dark:text-white tracking-tight">
              Chicamocha
            </span>
          </div>
          <button
            onClick={close}
            className="md:hidden p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            const isConv = href === "/conversations";
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                  active
                    ? "bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white font-medium"
                    : "text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {isConv && (humanRequested > 0 || humanActive > 0) && (
                  <span className="flex items-center gap-0.5">
                    {humanRequested > 0 && (
                      <span className="min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold bg-red-500 text-white flex items-center justify-center tabular-nums">
                        {humanRequested > 99 ? "99+" : humanRequested}
                      </span>
                    )}
                    {humanActive > 0 && (
                      <span className="min-w-[18px] h-4 px-1 rounded-full text-[10px] font-bold bg-blue-500 text-white flex items-center justify-center tabular-nums">
                        {humanActive > 99 ? "99+" : humanActive}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-[#1f1f1f] flex items-center gap-2 shrink-0">
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors flex-1 min-w-0"
          >
            <span className="truncate">Jeronimo Cardu</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
          <button
            onClick={toggleTheme}
            title={isDark ? "Modo claro" : "Modo oscuro"}
            className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>
    </>
  );
}
