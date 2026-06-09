"use client";

import { useEffect, useRef } from "react";
import { useConversationMessages } from "@/hooks/useConversations";
import { formatTime, cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface Props { phone: string }

export function ChatView({ phone }: Props) {
  const { messages, loading } = useConversationMessages(phone);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 dark:text-zinc-600 text-sm">Cargando mensajes...</p>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-300 dark:text-zinc-700 text-sm">Sin mensajes</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg) => {
        const isBot = msg.role === "assistant";
        return (
          <div key={msg.id} className={cn("flex gap-3 max-w-[640px]", isBot ? "mr-auto" : "ml-auto flex-row-reverse")}>
            <div className={cn("w-7 h-7 rounded-full shrink-0 flex items-center justify-center", isBot ? "bg-blue-100 dark:bg-blue-500/20" : "bg-gray-200 dark:bg-zinc-700")}>
              {isBot
                ? <Bot  className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                : <User className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
              }
            </div>
            <div className={cn("flex flex-col gap-1", isBot ? "items-start" : "items-end")}>
              <div className={cn(
                "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[480px]",
                isBot
                  ? "bg-gray-100 dark:bg-[#1a1a1a] text-gray-800 dark:text-zinc-200 rounded-tl-sm"
                  : "bg-blue-500 dark:bg-white/8 text-white dark:text-zinc-100 rounded-tr-sm"
              )}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              <p className="text-xs text-gray-400 dark:text-zinc-700">{formatTime(msg.created_at)}</p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
