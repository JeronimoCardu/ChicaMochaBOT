"use client";

import { useState } from "react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { Pedido, PedidoItem, DeliveryType, MethodPay, BurgerSize } from "@/types";
import { COMBO_INGREDIENTES } from "@/lib/combo-ingredients";
import { cn } from "@/lib/utils";

const ALL_PRODUCT_NAMES = Object.keys(COMBO_INGREDIENTES).sort();
const SIZES: BurgerSize[]      = ["doble", "triple", "cuádruple"];
const JHON_SIZES: BurgerSize[] = ["simple", "doble", "triple"];
const ALL_INGREDIENTS = [
  "bacon", "cheddar", "crispy", "salsa de la casa", "salsa roja",
  "lechuga", "tomate", "cebolla", "pepinillos", "rucula",
  "roquefort", "cebolla caramelizada", "provolone", "huevo",
];

const BURGAS_CON_CHEDDAR = new Set(["Burga 1", "Burga 2", "Burga 4", "Burga 6", "Burga 7", "Burga 8"]);
const PRODUCT_BASE_PRICE: Record<string, number> = { Papas: 2000 };

function makeItem(): PedidoItem {
  return {
    product_name: "Burga 1",
    quantity: 1,
    size: "doble",
    removed_ingredients: [],
    extra_ingredients: [],
    base_price: 12000,
    extra_price: 0,
    final_price: 12000,
    notes: "",
  };
}

function calcPreview(items: PedidoItem[]): number {
  return items.reduce((sum, item) => {
    const isPapas = item.product_name === "Papas";
    const basePrice = PRODUCT_BASE_PRICE[item.product_name] ?? 12000;
    let sizeExtra = 0;
    if (!isPapas) {
      if (item.product_name === "Jhon") {
        sizeExtra = item.size === "doble" ? 2000 : item.size === "triple" ? 4000 : 0;
      } else {
        sizeExtra = item.size === "triple" ? 2000 : item.size === "cuádruple" ? 4000 : 0;
      }
    }
    const extraIng = isPapas ? 0 : (item.extra_ingredients?.length ?? 0) * 2000;
    return sum + (basePrice + sizeExtra + extraIng) * (item.quantity ?? 1);
  }, 0);
}

function ItemEditor({
  item,
  onChange,
  onRemove,
}: {
  item: PedidoItem;
  onChange: (u: Partial<PedidoItem>) => void;
  onRemove: () => void;
}) {
  const isJhon = item.product_name === "Jhon";
  const isPapas = item.product_name === "Papas";
  const comboIngs = [
    ...(COMBO_INGREDIENTES[item.product_name] ?? []),
    ...(BURGAS_CON_CHEDDAR.has(item.product_name) ? ["cheddar"] : []),
  ];
  const extraCandidates = ALL_INGREDIENTS.filter((ing) => !comboIngs.includes(ing));

  const toggleRemoved = (ing: string) => {
    const list = item.removed_ingredients.includes(ing)
      ? item.removed_ingredients.filter((i) => i !== ing)
      : [...item.removed_ingredients, ing];
    onChange({ removed_ingredients: list });
  };

  const toggleExtra = (ing: string) => {
    const list = item.extra_ingredients.includes(ing)
      ? item.extra_ingredients.filter((i) => i !== ing)
      : [...item.extra_ingredients, ing];
    onChange({ extra_ingredients: list });
  };

  const sizes = isJhon ? JHON_SIZES : SIZES;

  return (
    <div className="bg-gray-50 dark:bg-[#171717] border border-gray-200 dark:border-[#252525] rounded-xl p-3.5 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={item.product_name}
          onChange={(e) => {
            const name = e.target.value;
            onChange({ product_name: name, removed_ingredients: [], extra_ingredients: [], size: name === "Jhon" ? "simple" : "doble" });
          }}
          className="flex-1 min-w-0 px-3 py-2 text-sm bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/30"
        >
          {ALL_PRODUCT_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>

        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" onClick={() => onChange({ quantity: Math.max(1, item.quantity - 1) })}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors">
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white w-6 text-center">{item.quantity}</span>
          <button type="button" onClick={() => onChange({ quantity: item.quantity + 1 })}
            className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {!isPapas && (
          <select
            value={item.size}
            onChange={(e) => onChange({ size: e.target.value as BurgerSize })}
            className="px-2 py-2 text-sm bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:outline-none capitalize shrink-0"
          >
            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}

        <button type="button" onClick={onRemove}
          className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors shrink-0">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {comboIngs.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 dark:text-zinc-600 mb-1.5">Quitar:</p>
          <div className="flex flex-wrap gap-1.5">
            {comboIngs.map((ing) => (
              <button key={ing} type="button" onClick={() => toggleRemoved(ing)}
                className={cn("text-xs px-2.5 py-1.5 rounded-full border transition-colors",
                  item.removed_ingredients.includes(ing)
                    ? "bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-400/20"
                    : "bg-white dark:bg-[#111111] text-gray-500 dark:text-zinc-500 border-gray-200 dark:border-[#2a2a2a] hover:border-red-200 dark:hover:border-red-400/20"
                )}>
                {ing}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isPapas && (
        <div>
          <p className="text-xs text-gray-400 dark:text-zinc-600 mb-1.5">Extras:</p>
          <div className="flex flex-wrap gap-1.5">
            {extraCandidates.map((ing) => (
              <button key={ing} type="button" onClick={() => toggleExtra(ing)}
                className={cn("text-xs px-2.5 py-1.5 rounded-full border transition-colors",
                  item.extra_ingredients.includes(ing)
                    ? "bg-green-50 dark:bg-green-400/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-400/20"
                    : "bg-white dark:bg-[#111111] text-gray-500 dark:text-zinc-500 border-gray-200 dark:border-[#2a2a2a] hover:border-green-200 dark:hover:border-green-400/20"
                )}>
                +{ing}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface Props {
  onSave: (created: Pedido) => void;
  onClose: () => void;
}

export function NewOrderModal({ onSave, onClose }: Props) {
  const [client, setClient]               = useState("");
  const [cell, setCell]                   = useState("");
  const [deliveryType, setDeliveryType]   = useState<DeliveryType>("pickup");
  const [address, setAddress]             = useState("");
  const [methodPay, setMethodPay]         = useState<MethodPay>("cash");
  const [requestedTime, setRequestedTime] = useState("");
  const [items, setItems]                 = useState<PedidoItem[]>([makeItem()]);
  const [customTotal, setCustomTotal]     = useState<string>("");
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const setItem = (i: number, update: Partial<PedidoItem>) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, ...update } : item)));

  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const calculatedTotal = calcPreview(items);
  const displayTotal = customTotal !== "" ? Number(customTotal) : calculatedTotal;

  const handleSave = async () => {
    if (!client.trim()) { setError("El nombre del cliente es obligatorio"); return; }
    if (!cell.trim())   { setError("El teléfono es obligatorio"); return; }
    if (items.length === 0) { setError("Agregá al menos un producto"); return; }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cell: cell.trim(), client: client.trim(),
          delivery_type: deliveryType,
          address: deliveryType === "delivery" ? address : null,
          method_pay: methodPay,
          requested_time: requestedTime || null,
          items,
          total: displayTotal,
        }),
      });
      if (!res.ok) {
        const { error: msg } = await res.json();
        setError(msg ?? "Error al crear el pedido");
        return;
      }
      const { pedido } = await res.json();
      onSave(pedido);
      onClose();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 bg-black/60 z-50 flex flex-col sm:items-start sm:justify-center sm:p-4 sm:overflow-y-auto" onClick={onClose}>
      {/* Modal */}
      <div
        className="w-full sm:max-w-2xl sm:mx-auto sm:my-8 bg-white dark:bg-[#111111] sm:border sm:border-gray-200 sm:dark:border-[#1f1f1f] sm:rounded-2xl flex flex-col h-full sm:h-auto sm:max-h-[90dvh] sm:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#1f1f1f] shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Nuevo pedido</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-zinc-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Cliente">
              <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Nombre o apellido" className={inputCls} />
            </Field>
            <Field label="Teléfono">
              <input value={cell} onChange={(e) => setCell(e.target.value)} placeholder="549XXXXXXXXX" className={inputCls} inputMode="numeric" />
            </Field>
          </div>

          <Field label="Tipo de entrega">
            <div className="flex gap-2">
              {(["delivery", "pickup"] as DeliveryType[]).map((t) => (
                <button key={t} type="button" onClick={() => setDeliveryType(t)}
                  className={cn("flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border",
                    deliveryType === t
                      ? "bg-orange-50 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-400/20"
                      : "bg-gray-50 dark:bg-[#1a1a1a] text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-[#2a2a2a]"
                  )}>
                  {t === "delivery" ? "Delivery" : "Retiro en local"}
                </button>
              ))}
            </div>
          </Field>

          {deliveryType === "delivery" && (
            <Field label="Dirección">
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle y número" className={inputCls} />
            </Field>
          )}

          <Field label="Método de pago">
            <div className="flex gap-2 flex-wrap">
              {(["cash", "transfer", "mp"] as MethodPay[]).map((m) => (
                <button key={m} type="button" onClick={() => setMethodPay(m)}
                  className={cn("flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-colors border",
                    methodPay === m
                      ? "bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-400/20"
                      : "bg-gray-50 dark:bg-[#1a1a1a] text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-[#2a2a2a]"
                  )}>
                  {m === "cash" ? "Efectivo" : m === "transfer" ? "Transferencia" : "Mercado Pago"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Horario solicitado (opcional)">
            <input value={requestedTime} onChange={(e) => setRequestedTime(e.target.value)} placeholder="ej: 21:30" className={inputCls} />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={labelCls}>Productos</label>
              <button type="button" onClick={() => setItems((prev) => [...prev, makeItem()])}
                className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /> Agregar ítem
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <ItemEditor key={i} item={item} onChange={(update) => setItem(i, update)} onRemove={() => removeItem(i)} />
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-[#1f1f1f] shrink-0 bg-white dark:bg-[#111111]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-zinc-600">$</span>
            <input
              type="number"
              value={customTotal !== "" ? customTotal : calculatedTotal}
              onChange={(e) => setCustomTotal(e.target.value)}
              onFocus={(e) => e.target.select()}
              className="w-28 px-2 py-1.5 text-sm font-semibold bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/30"
            />
            {customTotal !== "" && Number(customTotal) !== calculatedTotal && (
              <button type="button" onClick={() => setCustomTotal("")}
                className="text-xs text-gray-400 dark:text-zinc-600 hover:text-gray-600 dark:hover:text-zinc-400 transition-colors hidden sm:inline">
                ↺ {calculatedTotal.toLocaleString("es-AR")}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2.5 text-sm font-medium bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white rounded-lg transition-colors">
              {saving ? "Creando…" : "Crear pedido"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

const labelCls = "text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-1.5 block";
const inputCls = "w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-400/30";
