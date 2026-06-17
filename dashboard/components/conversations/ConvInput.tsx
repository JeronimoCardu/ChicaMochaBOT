"use client";

import { useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function ConvInput({ onSend, disabled, placeholder = "Escribe un mensaje..." }: Props) {
  const [text,    setText]    = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && !disabled && !sending;

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }

  async function handleSend() {
    if (!canSend) return;
    const msg = text.trim();
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setSending(true);
    try { await onSend(msg); } finally { setSending(false); }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-end gap-2 p-3 bg-zinc-800 border-t border-zinc-700">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => { setText(e.target.value); autoResize(); }}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Tomá la conversación para responder" : placeholder}
        disabled={disabled || sending}
        rows={1}
        className={cn(
          "flex-1 resize-none bg-zinc-700 text-zinc-100 placeholder-zinc-500 rounded-xl px-3.5 py-2.5 text-sm",
          "focus:outline-none focus:ring-1 focus:ring-green-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "overflow-y-auto"
        )}
        style={{ maxHeight: 128 }}
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
          canSend
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
        )}
      >
        {sending
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Send className="w-4 h-4" />
        }
      </button>
    </div>
  );
}
