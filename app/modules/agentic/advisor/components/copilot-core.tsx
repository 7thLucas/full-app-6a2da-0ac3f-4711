import { useEffect, useState } from "react";

/**
 * CopilotCore — a premium, enterprise-grade 3D presence for the ISI advisor.
 *
 * Deliberately NOT a cartoon copilot. It is a holographic governance core that
 * reflects the SAME consensus brain used by the orchestrator: its state is
 * driven by the live consensus (idle | deliberating | converged | speaking).
 *
 * Implemented with layered CSS 3D transforms + SVG so it is SSR-safe and adds
 * zero WebGL/runtime dependencies (keeps the publish typecheck clean and the
 * preview stable). It renders as a rotating, depth-layered orb that visibly
 * locks into a single brain when consensus converges.
 */

export type CopilotState = "idle" | "deliberating" | "converged" | "speaking";

const STATE_COPY: Record<CopilotState, { label: string; sub: string }> = {
  idle: { label: "Governance core online", sub: "Awaiting your question" },
  deliberating: { label: "Models cross-checking", sub: "Challenging each other in real time" },
  converged: { label: "One-brain consensus", sub: "Models converged — verdict ratified" },
  speaking: { label: "Delivering unified answer", sub: "Single governed verdict" },
};

const STATE_HUE: Record<CopilotState, string> = {
  idle: "#22d3ee", // cyan
  deliberating: "#a78bfa", // violet (active debate)
  converged: "#34d399", // emerald (locked)
  speaking: "#22d3ee",
};

export function CopilotCore({
  state,
  agreementScore,
  className = "",
}: {
  state: CopilotState;
  agreementScore?: number;
  className?: string;
}) {
  const hue = STATE_HUE[state];
  const copy = STATE_COPY[state];
  const active = state === "deliberating" || state === "speaking";

  // Subtle pulse driver for the speaking state (mouth/voice ring).
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (state !== "speaking") return;
    const id = setInterval(() => setPulse((p) => (p + 1) % 100), 90);
    return () => clearInterval(id);
  }, [state]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="relative"
        style={{ perspective: "900px", width: 196, height: 196 }}
        aria-label="ISI governance core"
        role="img"
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl transition-colors duration-700"
          style={{ background: `radial-gradient(circle, ${hue}40 0%, transparent 70%)` }}
        />

        {/* Rotating depth rings — the "3D" of the core */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            animation: `isiSpin ${active ? "7s" : "16s"} linear infinite`,
          }}
        >
          {[0, 60, 120].map((deg, i) => (
            <div
              key={deg}
              className="absolute inset-3 rounded-full border transition-colors duration-700"
              style={{
                borderColor: `${hue}${i === 0 ? "cc" : "66"}`,
                transform: `rotateY(${deg}deg) rotateX(${18 + i * 10}deg)`,
                boxShadow: `0 0 24px ${hue}33`,
              }}
            />
          ))}
        </div>

        {/* Core orb */}
        <div
          className="absolute inset-12 rounded-full transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${hue}, #0b1220 80%)`,
            boxShadow: `0 0 60px ${hue}55, inset 0 0 30px ${hue}44`,
          }}
        >
          {/* Voice ring while speaking */}
          {state === "speaking" && (
            <div
              className="absolute inset-0 rounded-full border-2"
              style={{
                borderColor: hue,
                transform: `scale(${1 + (Math.sin(pulse / 6) + 1) * 0.06})`,
                opacity: 0.5,
              }}
            />
          )}
          {/* Convergence lock pip */}
          {state === "converged" && agreementScore != null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-white drop-shadow">{agreementScore}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-center">
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: hue }}>
          {copy.label}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500">{copy.sub}</div>
      </div>

      {/* Local keyframes — scoped, no global CSS edits. */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@keyframes isiSpin{from{transform:rotateY(0deg)}to{transform:rotateY(360deg)}}",
        }}
      />
    </div>
  );
}
