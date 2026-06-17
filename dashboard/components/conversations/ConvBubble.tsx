"use client";

import { useState } from "react";
import { Bot, User, UserCheck, FileDown, Receipt } from "lucide-react";
import { Message } from "@/types";
import { formatTime, cn } from "@/lib/utils";

function MediaAttachment({ msg }: { msg: Message }) {
  const [lightbox, setLightbox] = useState(false);

  if (!msg.media_url || !msg.media_type) return null;

  if (msg.media_type === "audio") {
    return (
      <div className="mb-2">
        <audio
          controls
          src={msg.media_url}
          className="w-full max-w-[320px] h-9"
          preload="none"
        />
      </div>
    );
  }

  if (msg.media_type === "image") {
    return (
      <div className="mb-2">
        {msg.is_receipt && (
          <div className="flex items-center gap-1 mb-1.5 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded text-xs text-amber-400 w-fit">
            <Receipt className="w-3 h-3" />
            Posible comprobante
          </div>
        )}
        <img
          src={msg.media_url}
          alt="Imagen recibida"
          className="max-w-[260px] rounded-xl cursor-zoom-in object-cover border border-zinc-200/20"
          onClick={() => setLightbox(true)}
        />
        {lightbox && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-zoom-out p-4"
            onClick={() => setLightbox(false)}
          >
            <img
              src={msg.media_url}
              alt="Imagen recibida"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
            />
          </div>
        )}
      </div>
    );
  }

  // video, document, or other binary types
  return (
    <div className="mb-2">
      <a
        href={msg.media_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline"
      >
        <FileDown className="w-3.5 h-3.5" />
        Descargar archivo
      </a>
    </div>
  );
}

export function ConvBubble({ msg }: { msg: Message }) {
  const isUser      = msg.role === "user";
  const isAssistant = msg.role === "assistant";
  const isHuman     = msg.role === "human";

  if (isUser) {
    return (
      <div className="flex gap-2.5 max-w-[75%]">
        <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-zinc-700">
          <User className="w-3.5 h-3.5 text-zinc-400" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="bg-white dark:bg-zinc-100 text-zinc-900 px-3.5 py-2.5 rounded-2xl rounded-tl-sm text-sm leading-relaxed max-w-[480px]">
            <MediaAttachment msg={msg} />
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
          <p className="text-xs text-zinc-500 pl-1">{formatTime(msg.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 max-w-[75%] ml-auto flex-row-reverse">
      <div className={cn(
        "w-7 h-7 rounded-full shrink-0 flex items-center justify-center",
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
          "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[480px]",
          isHuman
            ? "bg-green-500 text-white rounded-tr-sm"
            : "bg-zinc-700 text-zinc-100 rounded-tr-sm"
        )}>
          <p className="whitespace-pre-wrap">{msg.content}</p>
        </div>
        <p className="text-xs text-zinc-500 pr-1">{formatTime(msg.created_at)}</p>
      </div>
    </div>
  );
}
