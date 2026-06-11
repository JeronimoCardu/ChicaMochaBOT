"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Edit2, Trash2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  cell: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ActionMenu({ orderId: _orderId, cell, onEdit, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmingDelete(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const close = () => {
    setOpen(false);
    setConfirmingDelete(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          if (open) setConfirmingDelete(false);
        }}
        className="p-1 rounded-md text-gray-300 dark:text-zinc-700 hover:text-gray-600 dark:hover:text-zinc-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        title="Acciones"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-50 min-w-[170px] bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden">
          {confirmingDelete ? (
            <div className="p-3 space-y-2">
              <p className="text-xs text-gray-600 dark:text-zinc-400 font-medium">¿Eliminar este pedido?</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                    onDelete();
                  }}
                  className="flex-1 py-1.5 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmingDelete(false); }}
                  className="flex-1 py-1.5 text-xs font-medium bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-[#333] rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); close(); onEdit(); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                Editar pedido
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); setConfirmingDelete(true); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                Eliminar pedido
              </button>

              <div className="border-t border-gray-100 dark:border-[#2a2a2a]" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                  router.push(`/conversations/${encodeURIComponent(cell)}`);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />
                Ver conversación
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
