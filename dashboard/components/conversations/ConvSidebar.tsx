"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Search, X, Loader2 } from "lucide-react";
import { HumanConversation } from "@/types";
import { ConvBadge } from "./ConvBadge";
import { supabase } from "@/lib/supabase";
import { formatPhone, cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────
function relativeTime(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function initials(name: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

const AVATAR_COLOR: Record<string, string> = {
  human_requested: "bg-orange-500/20 text-orange-300",
  human_active:    "bg-blue-500/20 text-blue-300",
  ai:              "bg-green-500/20 text-green-300",
  closed:          "bg-zinc-700 text-zinc-500",
};

// ── Highlight matching text ───────────────────────────────────────────────────
// split() with a capturing group places matches at odd indices
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text || ""}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-yellow-400/25 text-yellow-200 rounded-sm not-italic">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  conversations:       HumanConversation[];
  loading:             boolean;
  humanRequestedCount: number;
  selectedPhone:       string | null;
  onSelect:            (phone: string) => void;
  newPhone?:           string | null;
  updatedPhones?:      Set<string>;
  onClearUpdated?:     (phone: string) => void;
}

export function ConvSidebar({
  conversations,
  loading,
  humanRequestedCount,
  selectedPhone,
  onSelect,
  newPhone,
  updatedPhones,
  onClearUpdated,
}: Props) {
  const [query,              setQuery]              = useState("");
  const [contentPhones,      setContentPhones]      = useState<Set<string>>(new Set());
  const [isSearching,        setIsSearching]        = useState(false);
  const [shortcutLabel,      setShortcutLabel]      = useState("Ctrl K");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect Mac for shortcut badge
  useEffect(() => {
    if (/mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent)) {
      setShortcutLabel("⌘K");
    }
  }, []);

  // ── Ctrl+K / ⌘K — focus search; Escape — blur ────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = searchInputRef.current;
        if (!input) return;
        input.focus();
        input.select();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ── Debounced content search in messages table ────────────────────────────
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setContentPhones(new Set());
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("messages")
        .select("phone")
        .ilike("content", `%${q}%`)
        .limit(200);
      setContentPhones(new Set((data || []).map((m: { phone: string }) => m.phone)));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // ── Filter conversations ──────────────────────────────────────────────────
  const q = query.trim().toLowerCase();
  const filtered = q.length === 0
    ? conversations
    : conversations.filter((c) => {
        const inName    = c.client_name?.toLowerCase().includes(q);
        const inPhone   = c.phone.includes(q);
        const inPreview = c.last_message?.toLowerCase().includes(q);
        const inHistory = contentPhones.has(c.phone);
        return inName || inPhone || inPreview || inHistory;
      });

  function handleSelect(phone: string) {
    onClearUpdated?.(phone);
    onSelect(phone);
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900 border-r border-zinc-800">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800 shrink-0">
        <h2 className="font-semibold text-zinc-100 text-base">Conversaciones</h2>
        {humanRequestedCount > 0 && (
          <span className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
            <Bell className="w-3 h-3" />
            {humanRequestedCount}
          </span>
        )}
      </div>

      {/* Search input */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nombre, teléfono o mensajes..."
            className="w-full pl-8 pr-14 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors"
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); searchInputRef.current?.focus(); }}
              className="absolute right-2 flex items-center justify-center w-5 h-5 rounded hover:bg-zinc-700 transition-colors"
            >
              <X className="w-3 h-3 text-zinc-400" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 text-[10px] text-zinc-600 font-mono pointer-events-none whitespace-nowrap">
              {shortcutLabel}
            </kbd>
          )}
        </div>
      </div>

      {/* Attention banner */}
      {humanRequestedCount > 0 && (
        <div className="mx-3 mb-1 px-3 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg shrink-0">
          <p className="text-xs text-orange-300 font-medium">
            ⚠ {humanRequestedCount} cliente{humanRequestedCount > 1 ? "s" : ""} esperando atención humana
          </p>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-px pt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-3 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-2 py-0.5">
                  <div className="h-3.5 bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : q.length > 0 && isSearching && filtered.length === 0 ? (
          <div className="flex items-center justify-center gap-2 h-20 text-zinc-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Buscando...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-zinc-600 text-sm">
            {q.length > 0 ? (
              <>
                <Search className="w-8 h-8 opacity-30" />
                <p>Sin resultados para &ldquo;{query}&rdquo;</p>
              </>
            ) : (
              <p>Sin conversaciones</p>
            )}
          </div>
        ) : (
          <div className="space-y-px pt-1">
            {filtered.map((conv) => {
              const isSelected = conv.phone === selectedPhone;
              const isNew      = newPhone === conv.phone;
              const isUpdated  = !isSelected && updatedPhones?.has(conv.phone);
              const displayName = conv.client_name || formatPhone(conv.phone);

              return (
                <button
                  key={conv.phone}
                  onClick={() => handleSelect(conv.phone)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-3 text-left transition-colors",
                    isSelected ? "bg-zinc-700/60" : "hover:bg-zinc-800/60",
                    isNew && "animate-slide-in ring-1 ring-orange-400/30 ring-inset"
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-semibold text-sm relative",
                    AVATAR_COLOR[conv.status]
                  )}>
                    {initials(conv.client_name)}
                    {isUpdated && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400 border-2 border-zinc-900" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="font-medium text-zinc-100 text-sm truncate">
                        {q ? (
                          <Highlight text={displayName} query={query.trim()} />
                        ) : (
                          displayName
                        )}
                      </span>
                      <span className="text-xs text-zinc-500 shrink-0">
                        {relativeTime(conv.last_message_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-xs text-zinc-500 truncate leading-snug">
                        {q && conv.last_message ? (
                          <Highlight text={conv.last_message} query={query.trim()} />
                        ) : (
                          conv.last_message || "—"
                        )}
                      </p>
                      {conv.unread_count > 0 && !isSelected && (
                        <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-green-500 text-white text-[10px] font-bold rounded-full px-1">
                          {conv.unread_count > 99 ? "99+" : conv.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 min-w-0">
                      <ConvBadge status={conv.status} />
                      {conv.status === "human_active" && conv.assigned_operator && (
                        <span className="text-xs text-zinc-600 truncate min-w-0 flex-1">
                          por {conv.assigned_operator}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Content-search spinner shown while more results may arrive */}
            {q.length >= 2 && isSearching && (
              <div className="flex items-center justify-center gap-1.5 py-3 text-xs text-zinc-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                Buscando en historial...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
