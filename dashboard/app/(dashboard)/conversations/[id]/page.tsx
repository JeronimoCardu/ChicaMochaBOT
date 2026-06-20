"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useHumanConversations } from "@/hooks/useHumanConversations";
import { ConvSidebar }   from "@/components/conversations/ConvSidebar";
import { ConvChat }      from "@/components/conversations/ConvChat";
import { ConvInfoPanel } from "@/components/conversations/ConvInfoPanel";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const phone  = decodeURIComponent(params.id as string);

  const [operatorName,    setOperatorName]    = useState("Operador");
  const [showInfoMobile,  setShowInfoMobile]  = useState(false);

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
    clearUpdated(phone);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  function changeOperatorName() {
    const name = window.prompt("Tu nombre de operador:", operatorName);
    if (name?.trim()) {
      const trimmed = name.trim();
      setOperatorName(trimmed);
      localStorage.setItem("op_name", trimmed);
    }
  }

  function handleSidebarSelect(selected: string) {
    clearUpdated(selected);
    router.push("/conversations/" + encodeURIComponent(selected));
  }

  const conversation = conversations.find((c) => c.phone === phone) ?? null;

  return (
    <div className="h-full overflow-hidden flex">

      {/* ── Col 1: Sidebar (hidden on mobile) ── */}
      <div className="hidden md:flex md:w-72 lg:w-72 h-full shrink-0 flex-col">
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
            selectedPhone={phone}
            onSelect={handleSidebarSelect}
            newPhone={newPhone}
            updatedPhones={updatedPhones}
            onClearUpdated={clearUpdated}
          />
        </div>
      </div>

      {/* ── Col 2: Chat ── */}
      <div className="flex-1 h-full flex flex-col min-w-0">
        {conversation ? (
          <ConvChat
            conversation={conversation}
            operatorName={operatorName}
            onBack={() => router.push("/conversations")}
            onStatusChange={refresh}
            onToggleInfo={() => setShowInfoMobile(true)}
          />
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center bg-[#0b141a]">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#0b141a] text-zinc-600 text-sm">
            Conversación no encontrada
          </div>
        )}
      </div>

      {/* ── Col 3: Info panel (desktop) ── */}
      {conversation && (
        <div className="hidden lg:flex lg:w-80 xl:w-96 h-full shrink-0">
          <ConvInfoPanel
            conversation={conversation}
            operatorName={operatorName}
            onStatusChange={refresh}
          />
        </div>
      )}

      {/* ── Mobile info overlay ── */}
      {showInfoMobile && conversation && (
        <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto lg:hidden">
          <ConvInfoPanel
            conversation={conversation}
            operatorName={operatorName}
            onStatusChange={() => { refresh(); setShowInfoMobile(false); }}
            onClose={() => setShowInfoMobile(false)}
          />
        </div>
      )}
    </div>
  );
}
