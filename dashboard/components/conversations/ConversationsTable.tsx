"use client";

import { useConversations } from "@/hooks/useConversations";
import { formatTime, formatPhone, cn } from "@/lib/utils";
import { UserCheck, Bot, User, ShoppingBag } from "lucide-react";
import Link from "next/link";

export function ConversationsTable() {
  const { conversations, loading, takeOver } = useConversations();

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl py-14 text-center">
        <p className="text-sm text-gray-400 dark:text-zinc-600">Sin conversaciones</p>
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile: card list ── */}
      <div className="md:hidden space-y-2">
        {conversations.map((conv) => (
          <div key={conv.phone} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="font-mono text-xs text-gray-700 dark:text-zinc-200 mb-0.5">{formatPhone(conv.phone)}</p>
                <div className="flex items-center gap-1.5">
                  {conv.lastRole === "assistant"
                    ? <Bot  className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />
                    : <User className="w-3 h-3 text-gray-400 dark:text-zinc-500 shrink-0" />
                  }
                  <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{conv.lastMessage}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <p className="text-[10px] text-gray-400 dark:text-zinc-600">{formatTime(conv.lastActivity)}</p>
                {conv.inHandoff ? (
                  <span className="text-[10px] bg-purple-50 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-400/20">
                    Humano
                  </span>
                ) : (
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-400/20">
                    IA activa
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-[#1a1a1a]">
              {conv.activePedido ? (
                <span className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400">
                  <ShoppingBag className="w-3 h-3" />
                  {conv.activePedido.state}
                </span>
              ) : (
                <span className="text-xs text-gray-300 dark:text-zinc-700">Sin pedido activo</span>
              )}
              <div className="flex items-center gap-2">
                {!conv.inHandoff && (
                  <button
                    onClick={() => takeOver(conv.phone)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-400/20 transition-colors border border-purple-200 dark:border-purple-400/20"
                  >
                    <UserCheck className="w-3 h-3" />
                    Tomar
                  </button>
                )}
                <Link
                  href={`/conversations/${conv.phone}`}
                  className="text-xs px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                >
                  Ver
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden md:block bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#1f1f1f] rounded-xl overflow-hidden shadow-sm dark:shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-[#1f1f1f]">
              {["Número", "Último mensaje", "Hora", "Pedido activo", "Estado", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider bg-gray-50 dark:bg-transparent">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {conversations.map((conv, i) => (
              <tr
                key={conv.phone}
                className={cn(
                  "hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors",
                  i !== conversations.length - 1 && "border-b border-gray-50 dark:border-[#171717]"
                )}
              >
                <td className="px-4 py-3">
                  <p className="text-gray-700 dark:text-zinc-200 font-mono text-xs">{formatPhone(conv.phone)}</p>
                </td>
                <td className="px-4 py-3 max-w-[240px]">
                  <div className="flex items-center gap-2">
                    {conv.lastRole === "assistant"
                      ? <Bot  className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                      : <User className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                    }
                    <p className="text-gray-500 dark:text-zinc-400 text-xs truncate">{conv.lastMessage}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-400 dark:text-zinc-600">{formatTime(conv.lastActivity)}</p>
                </td>
                <td className="px-4 py-3">
                  {conv.activePedido ? (
                    <span className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400">
                      <ShoppingBag className="w-3 h-3" />
                      {conv.activePedido.state}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300 dark:text-zinc-700">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {conv.inHandoff ? (
                    <span className="text-xs bg-purple-50 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-400/20">
                      Humano
                    </span>
                  ) : (
                    <span className="text-xs bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-400/20">
                      IA activa
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {!conv.inHandoff && (
                      <button
                        onClick={() => takeOver(conv.phone)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-400/20 transition-colors border border-purple-200 dark:border-purple-400/20"
                      >
                        <UserCheck className="w-3 h-3" />
                        Tomar
                      </button>
                    )}
                    <Link
                      href={`/conversations/${conv.phone}`}
                      className="text-xs px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                    >
                      Ver
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
