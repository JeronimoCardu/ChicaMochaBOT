"use client";

import { useParams } from "next/navigation";
import { ChatView } from "@/components/conversations/ChatView";
import { useConversations } from "@/hooks/useConversations";
import { formatPhone } from "@/lib/utils";
import { ArrowLeft, UserCheck, Bot } from "lucide-react";
import Link from "next/link";

export default function ConversationPage() {
  const params  = useParams();
  const phone   = decodeURIComponent(params.id as string);
  const { conversations, takeOver } = useConversations();
  const conv    = conversations.find((c) => c.phone === phone);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-[#1f1f1f] shrink-0 bg-white dark:bg-transparent">
        <Link
          href="/dashboard/conversations"
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white text-sm">{formatPhone(phone)}</p>
          {conv?.activePedido && (
            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">
              Pedido activo · {conv.activePedido.state}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {conv?.inHandoff ? (
            <span className="flex items-center gap-1.5 text-xs bg-purple-50 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-400/20">
              <UserCheck className="w-3.5 h-3.5" /> Control humano activo
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-400/20">
              <Bot className="w-3.5 h-3.5" /> IA activa
            </span>
          )}
          {!conv?.inHandoff && (
            <button
              onClick={() => takeOver(phone)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-400/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-400/20 transition-colors border border-purple-200 dark:border-purple-400/20 font-medium"
            >
              <UserCheck className="w-3.5 h-3.5" /> Tomar conversación
            </button>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-transparent">
        <ChatView phone={phone} />
      </div>
    </div>
  );
}
