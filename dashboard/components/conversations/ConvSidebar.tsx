"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Search, X, Loader2 } from "lucide-react";
import { HumanConversation } from "@/types";
import { ConvBadge } from "./ConvBadge";
import { supabase } from "@/lib/supabase";
import { formatPhone, cn } from "@/lib/utils";
import {
  normalizeText,
  normalizePhone,
  buildHighlightRegex,
} from "@/lib/convSearch";

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

// ── Accent-insensitive highlight ──────────────────────────────────────────────
// regex built by buildHighlightRegex: matches land at odd indices after split
function Highlight({ text, regex }: { text: string; regex: RegExp | null }) {
  if (!regex || !text) return <>{text || ""}</>;

  // RegExp.prototype.split reuses lastIndex; clone to reset it
  const re = new RegExp(regex.source, regex.flags);
  const parts = text.split(re);

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
  const [query,         setQuery]         = useState("");
  const [contentPhones, setContentPhones] = useState<Set<string>>(new Set());
  const [isSearching,   setIsSearching]   = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect Mac for keyboard shortcut badge
  useEffect(() => {
    if (/mac/i.test(navigator.platform) || /mac/i.test(navigator.userAgent)) {
      setShortcutLabel("⌘K");
    }
  }, []);

  // ── Ctrl+K / ⌘K — focus+select; Escape — blur ────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const el = searchInputRef.current;
        if (!el) return;
        el.focus();
        el.select();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ── Debounced DB search (accent-insensitive via Supabase RPC) ─────────────
  // Splits query into words; each word is searched independently and results
  // are intersected so that ALL words must appear somewhere in the conversation.
  useEffect(() => {
    const words = normalizeText(query)
      .split(" ")
      .filter((w) => w.length >= 2);

    if (!words.length) {
      setContentPhones(new Set());
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();

    (async () => {
      try {
        let phones: Set<string> | null = null;

        for (const word of words) {
          if (controller.signal.aborted) return;

          const { data } = await supabase.rpc("search_messages_unaccent", { q: word });
          const wordSet = new Set<string>(
            (data ?? []).map((r: { phone: string }) => r.phone)
          );

          if (phones === null) {
            phones = wordSet;
          } else {
            const prev = phones as Set<string>;
            phones = new Set<string>(Array.from(prev).filter((p: string) => wordSet.has(p)));
          }

          if (phones.size === 0) break; // early exit: no possible matches
        }

        if (!controller.signal.aborted) {
          setContentPhones(phones ?? new Set());
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    })();

    return () => controller.abort();
  }, [query]);

  // ── Pre-computed normalized query values ──────────────────────────────────
  const normQuery   = normalizeText(query);
  const queryWords  = normQuery.split(" ").filter(Boolean);
  const phoneDigits = normalizePhone(query);
  const hasQuery    = queryWords.length > 0;

  // Highlight regex built once per query change
  const hlRegex = useMemo(
    () => (hasQuery ? buildHighlightRegex(query) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );

  // ── Filter + rank conversations ───────────────────────────────────────────
  // Ranking: name-match > phone-match > preview-match > history-match
  // Primary sort kept from the hook (priority order); secondary sort is score.
  const filtered = useMemo(() => {
    if (!hasQuery) return conversations;

    const scored: Array<{ conv: HumanConversation; score: number }> = [];

    for (const conv of conversations) {
      const normName    = normalizeText(conv.client_name ?? "");
      const normPhone   = conv.phone;  // already pure digits
      const normPreview = normalizeText(conv.last_message ?? "");
      const inHistory   = contentPhones.has(conv.phone);

      // Require all words to match in at least one local field, OR conversation
      // is confirmed by DB to have all words in its message history.
      const localMatch = queryWords.every(
        (w) => normName.includes(w) || normPhone.includes(w) || normPreview.includes(w)
      );
      if (!localMatch && !inHistory) continue;

      // Relevance score
      let score = 0;
      for (const w of queryWords) {
        if (normName.includes(w))    score += 30;
        if (normPhone.includes(w))   score += 20;
        if (normPreview.includes(w)) score += 10;
      }
      // Bonus: exact digit run match in phone (e.g. user types "2325")
      if (phoneDigits.length >= 4 && normPhone.includes(phoneDigits)) score += 50;
      if (inHistory) score += 5;

      scored.push({ conv, score });
    }

    return scored.sort((a, b) => b.score - a.score).map((r) => r.conv);
  }, [conversations, hasQuery, queryWords, phoneDigits, contentPhones]);

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

      {/* Search bar */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-500 pointer-events-none shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nombre, teléfono o mensajes..."
            aria-label="Buscar conversaciones"
            className="w-full pl-8 pr-14 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors"
          />
          {query ? (
            <button
              onClick={() => { setQuery(""); searchInputRef.current?.focus(); }}
              aria-label="Limpiar búsqueda"
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
          /* Skeleton */
          <div className="space-y-px pt-1" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-3 py-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-2 py-0.5">
                  <div className="h-3.5 bg-zinc-800 rounded w-2/3" />
                  <div className="h-3 bg-zinc-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : hasQuery && isSearching && filtered.length === 0 ? (
          /* DB searching */
          <div className="flex items-center justify-center gap-2 h-24 text-zinc-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Buscando...
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-40 gap-3 text-zinc-600 text-sm">
            {hasQuery ? (
              <>
                <Search className="w-8 h-8 opacity-25" />
                <p className="text-center">
                  Sin resultados para<br />
                  <span className="text-zinc-400 font-medium">&ldquo;{query}&rdquo;</span>
                </p>
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
              const inHistory   = hasQuery && contentPhones.has(conv.phone);

              return (
                <button
                  key={conv.phone}
                  onClick={() => handleSelect(conv.phone)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-3 text-left transition-colors",
                    isSelected ? "bg-zinc-700/60" : "hover:bg-zinc-800/60 active:bg-zinc-800",
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
                        {hlRegex
                          ? <Highlight text={displayName} regex={hlRegex} />
                          : displayName}
                      </span>
                      <span className="text-xs text-zinc-500 shrink-0">
                        {relativeTime(conv.last_message_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-xs text-zinc-500 truncate leading-snug">
                        {hlRegex && conv.last_message
                          ? <Highlight text={conv.last_message} regex={hlRegex} />
                          : (conv.last_message || "—")}
                      </p>
                      {conv.unread_count > 0 && !isSelected && (
                        <span className="shrink-0 min-w-[18px] h-[18px] flex items-center justify-center bg-green-500 text-white text-[10px] font-bold rounded-full px-1">
                          {conv.unread_count > 99 ? "99+" : conv.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <ConvBadge status={conv.status} />
                      {conv.status === "human_active" && conv.assigned_operator && (
                        <span className="text-xs text-zinc-600 truncate min-w-0 flex-1">
                          por {conv.assigned_operator}
                        </span>
                      )}
                      {/* Badge: matched via full message history */}
                      {inHistory && !conv.last_message?.toLowerCase().includes(normalizeText(query)) && (
                        <span className="text-[10px] text-zinc-600 italic shrink-0">
                          en historial
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* "Searching history" spinner — shown only while DB search is pending */}
            {hasQuery && isSearching && filtered.length > 0 && (
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
