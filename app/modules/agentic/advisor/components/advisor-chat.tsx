import { useEffect, useRef, useState } from "react";
import {
  Shield,
  Send,
  Plus,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  fetchSession,
  saveContext,
  sendMessage,
  startNew,
  SubscriptionRequiredError,
  type AdvisorConversationView,
  type AdvisorMessageView,
  type BuyerContextInput,
} from "../advisor.client";

function formatUsd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

function RoiPanel({ roi }: { roi: NonNullable<AdvisorMessageView["roi"]> }) {
  const rows: Array<{ label: string; value: string; accent?: boolean }> = [
    { label: "AI risk exposure governed", value: `${formatUsd(roi.riskExposure)}/yr`, accent: true },
    { label: "Cost of a single ungoverned failure", value: formatUsd(roi.failureCost) },
    { label: "ISI governance contract", value: `${formatUsd(roi.dealSize)}/yr` },
    { label: "Net risk eliminated", value: `${formatUsd(roi.netBenefit)}/yr`, accent: true },
  ];
  return (
    <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Live ROI · {roi.roiMultiple}x risk eliminated vs. cost
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{r.label}</div>
            <div className={`text-sm font-black ${r.accent ? "text-cyan-400" : "text-white"}`}>
              {r.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModelsConsulted({ message }: { message: AdvisorMessageView }) {
  if (!message.modelsConsulted || message.modelsConsulted.length === 0) return null;
  const okCount = message.modelsConsulted.filter((m) => m.ok).length;
  return (
    <div className="mt-3 border-t border-slate-800 pt-3">
      <div className="mb-2 flex items-center gap-2">
        <Layers className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {okCount} of {message.modelsConsulted.length} models consulted
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {message.modelsConsulted.map((m) => (
          <span
            key={m.model}
            title={m.stance || undefined}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
              m.ok
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            {m.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {m.model}
          </span>
        ))}
      </div>
      {message.agreementNote && (
        <p className="mt-2 text-[11px] italic text-slate-500">{message.agreementNote}</p>
      )}
    </div>
  );
}

function ContextForm({
  initial,
  onSubmit,
  saving,
}: {
  initial: BuyerContextInput;
  onSubmit: (input: BuyerContextInput) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<BuyerContextInput>(initial);
  const fields: Array<{ key: keyof BuyerContextInput; label: string; placeholder: string; type: string }> = [
    { key: "annualAiSpend", label: "Annual AI spend (USD)", placeholder: "e.g. 250000", type: "number" },
    { key: "teamSize", label: "Team size", placeholder: "e.g. 40", type: "number" },
    { key: "industry", label: "Industry", placeholder: "e.g. Financial services", type: "text" },
    { key: "currentTools", label: "AI tools in use", placeholder: "e.g. ChatGPT, Gemini, internal copilots", type: "text" },
  ];
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="mb-1 text-lg font-black text-white">Before we begin</h3>
      <p className="mb-5 text-sm text-slate-400">
        A few details let the advisor compute your governance ROI from your own numbers.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400">
              {f.label}
            </label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder-slate-500 transition-colors focus:border-cyan-500 focus:outline-none"
            />
          </div>
        ))}
      </div>
      <button
        onClick={() => onSubmit(form)}
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-cyan-400 disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Begin advisory session
      </button>
    </div>
  );
}

export function AdvisorChat() {
  const [conversation, setConversation] = useState<AdvisorConversationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [savingContext, setSavingContext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    fetchSession()
      .then((data) => {
        if (active) setConversation(data.conversation);
      })
      .catch((e) => {
        if (!active) return;
        if (e instanceof SubscriptionRequiredError) {
          setNeedsSubscription(true);
        } else {
          setError(e.message ?? "Failed to load the advisor");
        }
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages.length, thinking]);

  if (needsSubscription) {
    if (typeof window !== "undefined") window.location.href = "/pricing";
    return null;
  }

  async function handleContext(form: BuyerContextInput) {
    if (!conversation) return;
    setSavingContext(true);
    setError(null);
    try {
      const { conversation: updated } = await saveContext(conversation._id, form);
      setConversation(updated);
    } catch (e) {
      if (e instanceof SubscriptionRequiredError) {
        window.location.href = "/pricing";
        return;
      }
      setError((e as Error).message);
    } finally {
      setSavingContext(false);
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !conversation || thinking) return;
    setInput("");
    setError(null);
    // Optimistic buyer turn.
    setConversation({
      ...conversation,
      messages: [
        ...conversation.messages,
        { role: "user", content: text, createdAt: new Date().toISOString() },
      ],
    });
    setThinking(true);
    try {
      const { conversation: updated } = await sendMessage(conversation._id, text);
      setConversation(updated);
    } catch (e) {
      if (e instanceof SubscriptionRequiredError) {
        window.location.href = "/pricing";
        return;
      }
      setError((e as Error).message);
    } finally {
      setThinking(false);
    }
  }

  async function handleNew() {
    setError(null);
    try {
      const convo = await startNew();
      setConversation(convo);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">
        {error ?? "Unable to load the advisor."}
      </div>
    );
  }

  const contextCaptured = conversation.buyerContext.captured;

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      {!contextCaptured ? (
        <ContextForm
          initial={{
            annualAiSpend: conversation.buyerContext.annualAiSpend?.toString() ?? "",
            teamSize: conversation.buyerContext.teamSize?.toString() ?? "",
            industry: conversation.buyerContext.industry ?? "",
            currentTools: conversation.buyerContext.currentTools ?? "",
          }}
          onSubmit={handleContext}
          saving={savingContext}
        />
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-300">{conversation.title}</span>
            </div>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-500"
            >
              <Plus className="h-3.5 w-3.5" /> New session
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
          >
            {conversation.messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
                <p className="max-w-md text-sm text-slate-400">
                  The ISI Sales Advisor consults the Online Trinity — Gemini, Claude, and ChatGPT —
                  and orchestrates one governed recommendation. Ask how ISI Nexus protects your AI
                  deployment, or where your governance gap is.
                </p>
              </div>
            )}

            {conversation.messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-cyan-500 text-white"
                      : "border border-slate-800 bg-slate-900 text-slate-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                  {m.role === "assistant" && (
                    <>
                      {m.roi && <RoiPanel roi={m.roi} />}
                      <ModelsConsulted message={m} />
                    </>
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Layers className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                    Consulting the Online Trinity and orchestrating a governed reply...
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-2 text-xs text-red-400">{error}</div>
          )}

          <div className="mt-3 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Ask the ISI Sales Advisor..."
              className="max-h-32 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-cyan-500 focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={thinking || !input.trim()}
              className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-white transition-colors hover:bg-cyan-400 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
