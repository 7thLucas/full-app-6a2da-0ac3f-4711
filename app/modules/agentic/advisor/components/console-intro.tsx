import { useRef, useState } from "react";
import { Play, Pause, ShieldCheck, Radar, ScanLine } from "lucide-react";

/**
 * ConsoleIntro — the video-forward presenter hero that frames the core message
 * before the buyer touches the console. It is a security-operations briefing,
 * NOT a chatbot welcome. If an owner-supplied presenter video URL is configured,
 * it plays inline; otherwise it falls back to an animated SOC briefing panel that
 * still reads as a live presenter console (never a toy assistant).
 */

const CORE_MESSAGE =
  "No single AI can be trusted on its own. ISI Nexus is the only layer that makes multiple AI models check and challenge each other in real time — so your enterprise never acts on a hallucination, a drift, or an unsafe decision.";

export function ConsoleIntro({ videoUrl }: { videoUrl?: string | null }) {
  const hasVideo = !!videoUrl && videoUrl !== "FILL_VIDEO_URL_HERE";
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      {/* Scan-grid backdrop for the SOC briefing feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative grid gap-0 lg:grid-cols-[1.1fr_1fr]">
        {/* Presenter panel */}
        <div className="relative aspect-video w-full bg-slate-950 lg:aspect-auto">
          {hasVideo ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl ?? undefined}
                className="h-full w-full object-cover"
                playsInline
                onEnded={() => setPlaying(false)}
              />
              <button
                onClick={toggle}
                className="absolute inset-0 flex items-center justify-center bg-slate-950/30 transition-colors hover:bg-slate-950/10"
                aria-label={playing ? "Pause briefing" : "Play briefing"}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/90 text-white shadow-lg">
                  {playing ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                </span>
              </button>
            </>
          ) : (
            // Animated presenter fallback — a live governance briefing console.
            <div className="flex h-full min-h-[260px] flex-col items-center justify-center p-8">
              <div className="relative mb-5">
                <Radar className="h-16 w-16 text-cyan-400" />
                <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/10" />
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                <ScanLine className="h-3.5 w-3.5" /> Live governance briefing
              </div>
              <p className="mt-3 max-w-sm text-center text-sm leading-relaxed text-slate-300">
                Your AI presenter is standing by. The console runs every answer through the Online
                Trinity and the ISI Judge before you ever see it.
              </p>
            </div>
          )}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-slate-950/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Console live
          </div>
        </div>

        {/* Message panel */}
        <div className="flex flex-col justify-center gap-4 p-7">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
            <ShieldCheck className="h-3.5 w-3.5" /> Enterprise security console
          </div>
          <h2 className="text-2xl font-black leading-tight text-white">
            AI a CISO can finally sign off on.
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">{CORE_MESSAGE}</p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { k: "Models cross-checked", v: "3 + Judge" },
              { k: "Consensus target", v: "~98%" },
              { k: "Threat vectors governed", v: "6" },
            ].map((s) => (
              <div key={s.k} className="rounded-lg border border-slate-800 bg-slate-950/50 p-2.5">
                <div className="text-sm font-black text-cyan-400">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
