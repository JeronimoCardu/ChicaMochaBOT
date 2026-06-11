import { ConversationsTable } from "@/components/conversations/ConversationsTable";

export default function ConversationsPage() {
  return (
    <div className="p-4 md:p-5 space-y-4 md:space-y-5">
      <div>
        <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-0.5 md:mb-1">Conversaciones</h1>
        <p className="text-xs md:text-sm text-gray-400 dark:text-zinc-500">Historial de chats y control de handoff humano.</p>
      </div>
      <ConversationsTable />
    </div>
  );
}
