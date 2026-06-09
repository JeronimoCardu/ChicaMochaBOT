"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { NewOrderModal } from "@/components/orders/NewOrderModal";
import { Pedido } from "@/types";

interface Props {
  onCreated?: (pedido: Pedido) => void;
}

export function NewOrderButton({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  const handleSave = (pedido: Pedido) => {
    onCreated?.(pedido);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Nuevo pedido
      </button>

      {open && (
        <NewOrderModal onSave={handleSave} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
