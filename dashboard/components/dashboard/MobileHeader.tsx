"use client";

import { Beef, Menu } from "lucide-react";
import { useSidebar } from "@/components/providers/ShellLayout";

export function MobileHeader() {
  const { toggle } = useSidebar();

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#1f1f1f] bg-white dark:bg-[#0d0d0d] shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-orange-500/20 flex items-center justify-center">
          <Beef className="w-4 h-4 text-orange-400" />
        </div>
        <span className="font-semibold text-sm text-gray-900 dark:text-white tracking-tight">
          Chicamocha
        </span>
      </div>
      <button
        onClick={toggle}
        className="p-2 rounded-lg text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>
    </header>
  );
}
