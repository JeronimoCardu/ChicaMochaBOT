"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, UserCheck, Bot, Info, AlertTriangle, X } from "lucide-react";
import { HumanConversation } from "@/types";
import { useConversationMessages } from "@/hooks/useConversations";
import { groupMessagesByDay } from "@/lib/convSearch";
import { ConvBadge } from "./ConvBadge";
import { ConvBubble } from "./ConvBubble";
import { ConvInput } from "./ConvInput";
import { formatPhone, cn } from "@/lib/utils";

// ── Day separator ─────────────────────────────────────────────────────────────
function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1 select-none" aria-hidden>
      <div className="flex-1 h-px bg-zinc-800/70" />
      <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap px-1">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-800/70" />
    </div>
  );
}

interface Props {
  conversation:    HumanConversation;
  operatorName:    string;
  onBack?:         () => void;
  onStatusChange?: () => void;
  onToggleInfo?:   () => void;
}

export function ConvChat({ conversation, operatorName, onBack, onStatusChange, onToggleInfo }: Props) {
  // Pass last_message_at as triggerRefetch: when conversations Realtime fires
  // (DB trigger updates the row on every new message), this forces a messages
  // re-fetch as a reliable fallback independent of messages table Realtime.
  const { messages, loading } = useConversationMessages(
    conversation.phone,
    conversation.last_message_at,
  );
  const [acting, setActing]   = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark as read when opened
  useEffect(() => {
    if (conversation.unread_count > 0) {
      fetch(`/api/conversations/${conversation.phone}/read`, { method: "PATCH" }).catch(() => {});
    }
  }, [conversation.phone, conversation.unread_count]);

  async function handleTake() {
    setActing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/conversations/${conversation.phone}/take`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operator_name: operatorName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "No se pudo tomar la conversación.");
        return;
      }
      onStatusChange?.();
    } catch {
      setErrorMsg("Error de conexión al tomar la conversación.");
    } finally { setActing(false); }
  }

  async function handleClose() {
    setActing(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/conversations/${conversation.phone}/close`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "No se pudo devolver la conversación a la IA.");
        return;
      }
      onStatusChange?.();
    } catch {
      setErrorMsg("Error de conexión al devolver la conversación a la IA.");
    } finally { setActing(false); }
  }

  async function handleSend(message: string) {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/conversations/${conversation.phone}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, operator_name: operatorName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "No se pudo enviar el mensaje por WhatsApp.");
      }
    } catch {
      setErrorMsg("Error de conexión al enviar el mensaje.");
    }
  }

  const canSend   = conversation.status === "human_active";
  const isHumanActive = conversation.status === "human_active";

  return (
    <div className="flex flex-col h-full w-full min-w-0 flex-1 bg-[#0b141a]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
        {onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-400 md:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold text-zinc-300 shrink-0">
          {(conversation.client_name?.[0] || "?").toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-100 text-sm truncate">
            {conversation.client_name || formatPhone(conversation.phone)}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-zinc-500">{formatPhone(conversation.phone)}</p>
            <ConvBadge status={conversation.status} />
          </div>
        </div>

        {/* Info toggle — visible on non-lg screens when panel is hidden */}
        {onToggleInfo && (
          <button
            onClick={onToggleInfo}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors lg:hidden shrink-0"
            title="Ver información del cliente"
          >
            <Info className="w-4 h-4" />
          </button>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {conversation.status === "human_requested" && (
            <button
              onClick={handleTake}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg disabled:opacity-60 transition-colors"
            >
              {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
              Tomar conversación
            </button>
          )}
          {conversation.status === "ai" && (
            <button
              onClick={handleTake}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium rounded-lg disabled:opacity-60 transition-colors"
            >
              {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
              Intervenir
            </button>
          )}
          {isHumanActive && (
            <button
              onClick={handleClose}
              disabled={acting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-xs font-medium rounded-lg disabled:opacity-60 transition-colors"
            >
              {acting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
              Devolver a IA
            </button>
          )}
        </div>
      </div>

      {/* Operator banner */}
      {isHumanActive && conversation.assigned_operator && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/15 border-b border-blue-600/20 shrink-0">
          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
          <p className="text-xs text-blue-300">
            Atendida por <span className="font-semibold">{conversation.assigned_operator}</span>
          </p>
        </div>
      )}

      {/* Error banner */}
      {errorMsg && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-600/15 border-b border-red-600/20 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <p className="text-xs text-red-300 flex-1">{errorMsg}</p>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-400 hover:text-red-300 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
            Sin mensajes
          </div>
        ) : (
          groupMessagesByDay(messages).map(({ label, messages: group }) => (
            <Fragment key={label}>
              <DayDivider label={label} />
              {group.map((msg) => <ConvBubble key={msg.id} msg={msg} />)}
            </Fragment>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ConvInput onSend={handleSend} disabled={!canSend} />
    </div>
  );
}
