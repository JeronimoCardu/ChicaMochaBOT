import { IngredientTable } from "@/components/stock/IngredientTable";

export default function StockPage() {
  return (
    <div className="p-5 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Stock</h1>
        <p className="text-sm text-gray-400 dark:text-zinc-500">
          Activar o desactivar ingredientes actualiza automáticamente la disponibilidad de productos.
        </p>
      </div>
      <IngredientTable />
    </div>
  );
}
