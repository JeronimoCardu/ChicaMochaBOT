"use client";

import { useState } from "react";
import { Bot, User, UserCheck, FileDown, Receipt, FileText } from "lucide-react";
import { Message } from "@/types";
import { formatTime, cn } from "@/lib/utils";

// ── Audio attachment ──────────────────────────────────────────────────────────
function AudioBubble({ msg }: { msg: Message }) {
  if (!msg.media_url && !msg.transcription) return null;

  // Backward-compat: old messages have transcription embedded in content
  // New messages have it in the transcription field and content = "🎤 Nota de voz"
  const text = msg.transcription ?? (
    msg.content.startsWith("🎤 ") && msg.content !== "🎤 Nota de voz" && msg.content !== "🎤 [audio no transcribible]"
      ? msg.content.replace(/^🎤\s*/, "")
      : null
  );

  return (
    <div className="flex flex-col gap-2 min-w-[240px] max-w-[340px]">
      {msg.media_url ? (
        <audio
          controls
          src={msg.media_url}
          preload="none"
          className="w-full h-9 rounded-lg"
        />
      ) : (
        <div className="text-xs text-zinc-400 italic">Audio no disponible</div>
      )}
      <div className="text-xs leading-relaxed">
        {text ? (
          <>
            <span className="text-zinc-500">Transcripción:</span>
            <span className="ml-1 text-zinc-800 dark:text-zinc-200">"{text}"</span>
          </>
        ) : (
          <span className="text-zinc-400 italic">No se pudo transcribir el audio.</span>
        )}
      </div>
    </div>
  );
}

// ── Image attachment ──────────────────────────────────────────────────────────
function ImageBubble({ msg }: { msg: Message }) {
  const [open, setOpen] = useState(false);
  const isProof = msg.is_payment_proof || msg.is_receipt; // support both old + new

  if (!msg.media_url) {
    return <div className="text-sm text-zinc-400 italic">📷 Imagen no disponible</div>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {isProof && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/15 border border-amber-500/35 rounded-lg w-fit">
          <Receipt className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-400 font-medium">Posible comprobante</span>
        </div>
      )}
      <img
        src={msg.media_url}
        alt="Imagen recibida"
        onClick={() => setOpen(true)}
        className="max-w-[260px] rounded-xl cursor-zoom-in object-cover border border-black/10"
      />
      {msg.content && msg.content !== "📷 Imagen" && msg.content !== "📷 [imagen]" && (
        <p className="text-xs text-zinc-500">{msg.content}</p>
      )}
      {open && (
        <div
          className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setOpen(false)}
        >
          <img
            src={msg.media_url}
            alt="Imagen recibida"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

// ── Document attachment ───────────────────────────────────────────────────────
function DocumentBubble({ msg }: { msg: Message }) {
  // content = filename (new format) or "📄 [documento: filename]" (old format)
  const filename = (() => {
    if (!msg.content) return "documento";
    const m = msg.content.match(/\[documento:\s*(.+)\]$/);
    if (m) return m[1].trim();
    if (msg.content.startsWith("📄")) return msg.content.replace(/^📄\s*/, "").trim() || "documento";
    return msg.content;
  })();

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600 rounded-xl max-w-[280px]">
      <FileText className="w-8 h-8 text-zinc-400 shrink-0" />
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{filename}</p>
        <p className="text-xs text-zinc-400">{msg.media_mime_type ?? "documento"}</p>
      </div>
      {msg.media_url && (
        <a
          href={msg.media_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors shrink-0"
          title="Descargar"
        >
          <FileDown className="w-3.5 h-3.5 text-white" />
        </a>
      )}
    </div>
  );
}

// ── Content renderer ──────────────────────────────────────────────────────────
function MessageContent({ msg }: { msg: Message }) {
  switch (msg.media_type) {
    case "audio":    return <AudioBubble    msg={msg} />;
    case "image":    return <ImageBubble    msg={msg} />;
    case "document": return <DocumentBubble msg={msg} />;
    default:         return <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>;
  }
}

// ── Main bubble ───────────────────────────────────────────────────────────────
export function ConvBubble({ msg }: { msg: Message }) {
  const isUser      = msg.role === "user";
  const isAssistant = msg.role === "assistant";
  const isHuman     = msg.role === "human";

  if (isUser) {
    return (
      <div className="flex gap-2.5 max-w-[78%]">
        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-zinc-700 mt-0.5">
          <User className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="bg-white dark:bg-zinc-100 text-zinc-900 px-3.5 py-2.5 rounded-2xl rounded-tl-sm max-w-[480px]">
            <MessageContent msg={msg} />
          </div>
          <p className="text-xs text-zinc-500 pl-1">{formatTime(msg.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 max-w-[78%] ml-auto flex-row-reverse">
      <div className={cn(
        "w-7 h-7 rounded-full shrink-0 flex items-center justify-center mt-0.5",
        isHuman ? "bg-green-500" : "bg-zinc-600"
      )}>
        {isHuman
          ? <UserCheck className="w-3.5 h-3.5 text-white" />
          : <Bot       className="w-3.5 h-3.5 text-zinc-300" />
        }
      </div>
      <div className="flex flex-col gap-0.5 items-end">
        {isHuman && msg.operator_name && (
          <p className="text-xs text-green-400 pr-1">👨 {msg.operator_name}</p>
        )}
        {isAssistant && (
          <p className="text-xs text-zinc-500 pr-1">🤖 IA</p>
        )}
        <div className={cn(
          "px-3.5 py-2.5 rounded-2xl max-w-[480px]",
          isHuman
            ? "bg-green-500 text-white rounded-tr-sm"
            : "bg-zinc-700 text-zinc-100 rounded-tr-sm"
        )}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
        </div>
        <p className="text-xs text-zinc-500 pr-1">{formatTime(msg.created_at)}</p>
      </div>
    </div>
  );
}
