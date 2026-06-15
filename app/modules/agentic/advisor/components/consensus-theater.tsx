import { useEffect, useState } from "react";
import { GitBranch, ShieldCheck, Cpu } from "lucide-react";
import type { AdvisorConsensusView } from "../advisor.client";

/**
 * ConsensusTheater — renders the visible model-vs-model debate as a
 * trust-building artifact. The Online Trinity diverges, cross-examines, and the
 * ISI Judge closes to one-brain convergence. We animate the turns appearing in
 * sequence so the buyer literally watches the AIs challenge each other before a
 * single answer is delivered. No governance internals are exposed.
 */

function modelColor(model: string): string {
  if (model === "ISI Judge") return "text-emerald-400";
  if (model === "Gemini") return "text-sky-400";
  if (model === "Claude") return "text-amber-400";
  if (model === "ChatGPT") return "text-violet-400";
  return "text-slate-300";
}

function roundLabel(round: number): string {
  if (round === 0) return "Round 1 · Independent positions";
  if (round === 1) return "Round 2 · Cross-examination";
  return "Round 3 · Governed convergence";
}

export function ConsensusTheater({
  consensus,
  animate = false,
}: {
  consensus: AdvisorConsensusView;
  animate?: boolean;
}) {
  const turns = consensus.turns ?? [];
  const [visible, setVisible] = useState(animate ? 0 : turns.length);

  useEffect(() => {
    if (!animate) {
      setVisible(turns.length);
      return;
    }
    setVisible(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setVisible(i);
      if (i >= turns.length) clearInterval(id);
    }, 520);
    return () => clearInterval(id);
  }, [animate, turns.length]);

  if (turns.length === 0) return null;

  let lastRound = -1;

  return (
    <div className="mt-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
            Multi-model consensus
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Agreement</span>
          <span
            className={`text-sm font-black ${
              consensus.converged ? "text-emerald-400" : "text-amber-400"
            }`}
          >
            {consensus.agreementScore}%
          </span>
        </div>
      </div>

      {/* Agreement bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-700"
          style={{ width: `${consensus.agreementScore}%` }}
        />
      </div>

      <div className="space-y-2">
        {turns.slice(0, visible).map((t, i) => {
          const showHeader = t.round !== lastRound;
          lastRound = t.round;
          const isJudge = t.model === "ISI Judge";
          return (
            <div key={i}>
              {showHeader && (
                <div className="mb-1.5 mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {roundLabel(t.round)}
                </div>
              )}
              <div
                className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 transition-all ${
                  isJudge
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-slate-800 bg-slate-900/60"
                }`}
              >
                {isJudge ? (
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <Cpu className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${modelColor(t.model)}`} />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[12px] font-bold ${modelColor(t.model)}`}>{t.model}</span>
                    <span className="text-[10px] tabular-nums text-slate-500">{t.confidence}%</span>
                  </div>
                  {t.stance && (
                    <p className="mt-0.5 text-[12px] font-medium text-slate-300">{t.stance}</p>
                  )}
                  {t.challenge && (
                    <p className="mt-0.5 text-[11px] italic leading-relaxed text-slate-500">
                      {t.challenge}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visible >= turns.length && consensus.converged && (
        <div className="mt-3 flex items-center gap-2 border-t border-emerald-500/20 pt-3">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-400">
            Models converged to one brain. A single governed verdict was ratified.
          </span>
        </div>
      )}
    </div>
  );
}
