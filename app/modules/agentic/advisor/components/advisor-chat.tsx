import { useEffect, useRef, useState } from "react";
import {
  Shield,
  Send,
  Plus,
  TrendingUp,
  Loader2,
  Activity,
  Lock,
  Gauge,
  Terminal,
} from "lucide-react";
import {
  fetchSession,
  saveContext,
  sendMessage,
  startNew,
  SubscriptionRequiredError,
  type AdvisorConversationView,
  type AdvisorMessageView,
  type AdvisorPriceRecommendationView,
  type BuyerContextInput,
} from "../advisor.client";
import { CopilotCore, type CopilotState } from "./copilot-core";
import { ConsensusTheater } from "./consensus-theater";

function formatUsd(n: number): string {
  return `$${Math.round(n).toLocaleString()}`;
}

// ─── Live ROI readout (security-console styling, not a chat bubble) ──────────

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

// ─── Owner price band (gated/personalized; IP stays protected) ──────────────

function PriceBand({ rec }: { rec: AdvisorPriceRecommendationView }) {
  return (
    <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Tailored engagement · {rec.anchorTier} tier
        </span>
      </div>
      <div className="text-lg font-black text-white">
        {formatUsd(rec.rangeLowUsd)} – {formatUsd(rec.rangeHighUsd)}
        <span className="ml-1 text-xs font-medium text-slate-400">/yr</span>
      </div>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{rec.rationale}</p>
    </div>
  );
}

// ─── Buyer context capture — framed as an intake console, not a chat ────────

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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
        <Terminal className="h-3.5 w-3.5" /> Threat-exposure intake
      </div>
      <h3 className="mb-1 text-lg font-black text-white">Calibrate the governance console to your enterprise</h3>
      <p className="mb-5 text-sm text-slate-400">
        The advisor computes your governance-risk exposure and a tailored engagement from your own
        numbers before the AIs deliberate.
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
        Initialize console
      </button>
    </div>
  );
}

// ─── Transcript entry rendered as a console record, not a chat bubble ───────

function ConsoleEntry({ m, isLatestAssistant }: { m: AdvisorMessageView; isLatestAssistant: boolean }) {
  if (m.role === "user") {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Terminal className="h-3 w-3" /> Operator query
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{m.content}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/80 to-slate-900/40 px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
        <Shield className="h-3 w-3" /> Governed verdict
        {m.consensus?.converged && (
          <span className="ml-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-400">
            {m.consensus.agreementScore}% consensus
          </span>
        )}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{m.content}</p>
      {m.consensus && <ConsensusTheater consensus={m.consensus} animate={isLatestAssistant} />}
      {m.roi && <RoiPanel roi={m.roi} />}
      {m.priceRecommendation && <PriceBand rec={m.priceRecommendation} />}
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

  // Derive copilot state from the SAME consensus brain.
  const assistantMsgs = conversation.messages.filter((m) => m.role === "assistant");
  const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
  const copilotState: CopilotState = thinking
    ? "deliberating"
    : lastAssistant?.consensus?.converged
      ? "converged"
      : "idle";

  if (!contextCaptured) {
    return (
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
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      {/* ── Left rail: the 3D copilot core + live status (console, not chat) ── */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <CopilotCore
            state={copilotState}
            agreementScore={lastAssistant?.consensus?.agreementScore}
          />
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Activity className="h-3.5 w-3.5 text-cyan-400" /> Online Trinity
          </div>
          <div className="space-y-2">
            {["Gemini", "Claude", "ChatGPT"].map((m) => (
              <div key={m} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{m}</span>
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> linked
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-xs">
              <span className="font-semibold text-emerald-300">ISI Judge</span>
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <Gauge className="h-3 w-3" /> adjudicating
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-slate-500"
        >
          <Plus className="h-3.5 w-3.5" /> New advisory session
        </button>
      </aside>

      {/* ── Right: transcript console ── */}
      <section className="flex h-[calc(100vh-13rem)] flex-col">
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
        >
          {conversation.messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>
              <p className="max-w-md text-sm text-slate-400">
                No single AI can be trusted on its own. Ask anything — the Online Trinity will
                challenge each other in real time and the ISI Judge will ratify one governed answer
                you can sign off on.
              </p>
            </div>
          )}

          {conversation.messages.map((m, i) => (
            <ConsoleEntry
              key={i}
              m={m}
              isLatestAssistant={m.role === "assistant" && m === lastAssistant && !thinking}
            />
          ))}

          {thinking && (
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-violet-300">
                <Activity className="h-3.5 w-3.5 animate-pulse text-violet-400" />
                Models deliberating — challenging each other toward one-brain consensus...
              </div>
            </div>
          )}
        </div>

        {error && <div className="mt-2 text-xs text-red-400">{error}</div>}

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
            placeholder="Query the governance console..."
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
      </section>
    </div>
  );
}
