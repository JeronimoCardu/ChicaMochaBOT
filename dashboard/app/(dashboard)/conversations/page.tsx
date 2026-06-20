"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useHumanConversations } from "@/hooks/useHumanConversations";
import { ConvSidebar }   from "@/components/conversations/ConvSidebar";
import { ConvChat }      from "@/components/conversations/ConvChat";
import { ConvInfoPanel } from "@/components/conversations/ConvInfoPanel";

export default function ConversationsPage() {
  const router = useRouter();
  const [selectedPhone,  setSelectedPhone]  = useState<string | null>(null);
  const [operatorName,   setOperatorName]   = useState("Operador");
  const [showInfoPanel,  setShowInfoPanel]  = useState(false);

  const {
    conversations,
    loading,
    humanRequestedCount,
    newPhone,
    updatedPhones,
    clearUpdated,
    refresh,
  } = useHumanConversations();

  useEffect(() => {
    const saved = localStorage.getItem("op_name");
    if (saved) setOperatorName(saved);
  }, []);

  function changeOperatorName() {
    const name = window.prompt("Tu nombre de operador:", operatorName);
    if (name?.trim()) {
      const trimmed = name.trim();
      setOperatorName(trimmed);
      localStorage.setItem("op_name", trimmed);
    }
  }

  function handleSelect(phone: string) {
    clearUpdated(phone);
    if (window.innerWidth < 768) {
      router.push("/conversations/" + encodeURIComponent(phone));
    } else {
      setSelectedPhone(phone);
      setShowInfoPanel(false);
    }
  }

  const selectedConv = conversations.find((c) => c.phone === selectedPhone) ?? null;

  return (
    <div className="h-full overflow-hidden flex">

      {/* ── Col 1: Sidebar ── */}
      <div className="w-full md:w-72 lg:w-72 h-full shrink-0 flex flex-col">
        {/* Operator strip */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800 shrink-0">
          <span className="text-xs text-zinc-600">Operador:</span>
          <button
            onClick={changeOperatorName}
            className="flex items-center gap-1 text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <span className="font-medium">{operatorName}</span>
            <Pencil className="w-3 h-3" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ConvSidebar
            conversations={conversations}
            loading={loading}
            humanRequestedCount={humanRequestedCount}
            selectedPhone={selectedPhone}
            onSelect={handleSelect}
            newPhone={newPhone}
            updatedPhones={updatedPhones}
            onClearUpdated={clearUpdated}
          />
        </div>
      </div>

      {/* ── Col 2: Chat (desktop only) ── */}
      <div className="hidden md:flex flex-1 h-full min-w-0">
        {selectedConv ? (
          <ConvChat
            conversation={selectedConv}
            operatorName={operatorName}
            onStatusChange={refresh}
            onToggleInfo={() => setShowInfoPanel((v) => !v)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#0b141a] gap-3">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-zinc-500 text-sm">Seleccioná una conversación</p>
          </div>
        )}
      </div>

      {/* ── Col 3: Info panel ── */}
      {selectedConv && (
        <div className={
          showInfoPanel
            ? "flex w-80 xl:w-96 h-full shrink-0"
            : "hidden lg:flex lg:w-80 xl:w-96 h-full shrink-0"
        }>
          <ConvInfoPanel
            conversation={selectedConv}
            operatorName={operatorName}
            onStatusChange={refresh}
          />
        </div>
      )}
    </div>
  );
}
