import { useEffect, useState } from "react";
import { MessageSquare, X, Layers, Loader2, RefreshCw } from "lucide-react";
import {
  adminFetchConversations,
  adminFetchConversation,
  type AdvisorConversationView,
} from "../advisor.client";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AdminAdvisorConversations() {
  const [items, setItems] = useState<AdvisorConversationView[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<AdvisorConversationView | null>(null);
  const [openLoading, setOpenLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetchConversations();
      setItems(data.items);
      setTotal(data.total);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function openConversation(id: string) {
    setOpenLoading(true);
    try {
      const convo = await adminFetchConversation(id);
      setOpen(convo);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOpenLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-cyan-400" />
          <h2 className="font-black text-white">Advisor Conversations</h2>
          <span className="text-xs text-slate-500">{total} total</span>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-500"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
        </div>
      ) : error ? (
        <div className="px-6 py-8 text-sm text-red-400">{error}</div>
      ) : items.length === 0 ? (
        <div className="px-6 py-12 text-center text-sm text-slate-500">
          No advisor conversations yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {items.map((c) => {
            const lastMsg = c.messages[c.messages.length - 1];
            return (
              <button
                key={c._id}
                onClick={() => openConversation(c._id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-800/50"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{c.title}</div>
                  <div className="truncate text-xs text-slate-500">
                    {c.userEmail || c.userId} · {c.messages.length} messages
                    {lastMsg ? ` · ${lastMsg.content.slice(0, 60)}` : ""}
                  </div>
                </div>
                <div className="ml-4 shrink-0 text-xs text-slate-600">{formatDate(c.updatedAt)}</div>
              </button>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div className="min-w-0">
                <h3 className="truncate font-black text-white">{open.title}</h3>
                <p className="truncate text-xs text-slate-500">{open.userEmail || open.userId}</p>
              </div>
              <button onClick={() => setOpen(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="border-b border-slate-800 px-6 py-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "AI Spend", value: open.buyerContext.annualAiSpend != null ? `$${open.buyerContext.annualAiSpend.toLocaleString()}` : "—" },
                  { label: "Team Size", value: open.buyerContext.teamSize ?? "—" },
                  { label: "Industry", value: open.buyerContext.industry ?? "—" },
                  { label: "Tools", value: open.buyerContext.currentTools ?? "—" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</div>
                    <div className="truncate text-sm text-white">{String(s.value)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
              {openLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                </div>
              ) : (
                open.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 ${
                        m.role === "user"
                          ? "bg-cyan-500 text-white"
                          : "border border-slate-800 bg-slate-950 text-slate-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                      {m.role === "assistant" && m.modelsConsulted && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Layers className="h-3 w-3" />
                          {m.agreementNote ??
                            `${m.modelsConsulted.filter((x) => x.ok).length} of ${m.modelsConsulted.length} models consulted`}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
