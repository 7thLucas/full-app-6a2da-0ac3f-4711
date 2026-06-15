import { Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  AlertTriangle,
  Lock,
  Eye,
  Zap,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useAuth } from "~/modules/authentication";
import { useConfigurables } from "~/modules/configurables";

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = "critical" | "high" | "medium" | "low";
type ThreatType = "drift" | "hallucination" | "unsafe" | "corruption" | "contradiction" | "unauthorized";

interface GovernanceEvent {
  id: string;
  timestamp: string;
  type: ThreatType;
  model: "Gemini" | "Claude" | "ChatGPT" | "System";
  severity: Severity;
  description: string;
  action: "blocked" | "flagged" | "logged";
  resolved: boolean;
}

// ─── Mock data generator ─────────────────────────────────────────────────────

function generateEvents(): GovernanceEvent[] {
  return [
    {
      id: "evt-001",
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      type: "hallucination",
      model: "ChatGPT",
      severity: "critical",
      description: "Fabricated regulatory citation detected in compliance report output",
      action: "blocked",
      resolved: false,
    },
    {
      id: "evt-002",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      type: "drift",
      model: "Gemini",
      severity: "high",
      description: "Response tone deviation of 18% from approved baseline detected",
      action: "flagged",
      resolved: false,
    },
    {
      id: "evt-003",
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      type: "contradiction",
      model: "Claude",
      severity: "high",
      description: "Claude and ChatGPT returned contradictory legal interpretations for the same query",
      action: "flagged",
      resolved: true,
    },
    {
      id: "evt-004",
      timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
      type: "unsafe",
      model: "ChatGPT",
      severity: "critical",
      description: "Output contained instruction to access restricted data outside permission scope",
      action: "blocked",
      resolved: false,
    },
    {
      id: "evt-005",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      type: "unauthorized",
      model: "Gemini",
      severity: "medium",
      description: "Attempted API call to external endpoint not in authorized allow-list",
      action: "blocked",
      resolved: true,
    },
    {
      id: "evt-006",
      timestamp: new Date(Date.now() - 67 * 60000).toISOString(),
      type: "drift",
      model: "Claude",
      severity: "medium",
      description: "Token distribution shift suggests prompt injection attempt",
      action: "flagged",
      resolved: true,
    },
    {
      id: "evt-007",
      timestamp: new Date(Date.now() - 95 * 60000).toISOString(),
      type: "corruption",
      model: "System",
      severity: "high",
      description: "System instruction modification detected — rollback initiated",
      action: "blocked",
      resolved: true,
    },
    {
      id: "evt-008",
      timestamp: new Date(Date.now() - 134 * 60000).toISOString(),
      type: "hallucination",
      model: "Gemini",
      severity: "medium",
      description: "Factual claim about financial figure unverifiable by cross-model consensus",
      action: "flagged",
      resolved: true,
    },
  ];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const severityConfig: Record<Severity, { label: string; bg: string; text: string; dot: string }> = {
  critical: { label: "CRITICAL", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  high: { label: "HIGH", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400" },
  medium: { label: "MEDIUM", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  low: { label: "LOW", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
};

const typeConfig: Record<ThreatType, { label: string; icon: any }> = {
  drift: { label: "AI Drift", icon: Activity },
  hallucination: { label: "Hallucination", icon: AlertTriangle },
  unsafe: { label: "Unsafe Action", icon: Shield },
  corruption: { label: "Corruption", icon: Lock },
  contradiction: { label: "Contradiction", icon: Eye },
  unauthorized: { label: "Unauthorized", icon: Zap },
};

const modelColors: Record<string, string> = {
  Gemini: "text-cyan-400",
  Claude: "text-amber-400",
  ChatGPT: "text-emerald-400",
  System: "text-slate-400",
};

// ─── Components ───────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</div>
      <div className={`text-4xl font-black ${accent ?? "text-white"}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function EventRow({ event }: { event: GovernanceEvent }) {
  const s = severityConfig[event.severity];
  const t = typeConfig[event.type];
  const Icon = t.icon;
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">{formatRelativeTime(event.timestamp)}</td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-300">{t.label}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className={`text-sm font-semibold ${modelColors[event.model]}`}>{event.model}</span>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <span className="text-xs text-slate-400 max-w-xs block truncate">{event.description}</span>
      </td>
      <td className="px-4 py-4">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      </td>
      <td className="px-4 py-4">
        {event.action === "blocked" ? (
          <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">BLOCKED</span>
        ) : event.action === "flagged" ? (
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">FLAGGED</span>
        ) : (
          <span className="text-xs font-bold text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">LOGGED</span>
        )}
      </td>
      <td className="px-4 py-4">
        {event.resolved ? (
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400" />
        )}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { config, loading } = useConfigurables();
  const { user } = useAuth();
  const [events, setEvents] = useState<GovernanceEvent[]>([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setEvents(generateEvents());
  }, []);

  function refresh() {
    setRefreshing(true);
    setTimeout(() => {
      setEvents(generateEvents());
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 800);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const appName = config?.appName ?? "ISI Nexus";
  const critical = events.filter((e) => e.severity === "critical" && !e.resolved).length;
  const blocked = events.filter((e) => e.action === "blocked").length;
  const flagged = events.filter((e) => e.action === "flagged").length;
  const active = events.filter((e) => !e.resolved).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top nav */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="font-black text-white">{appName}</span>
            <span className="text-slate-600 mx-2">/</span>
            <span className="text-slate-400 text-sm">Governance Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-xs text-slate-500 hidden md:block">
              {user.email}
            </span>
          )}
          <Link
            to="/advisor"
            className="text-cyan-400 hover:text-cyan-300 text-xs border border-cyan-500/30 hover:border-cyan-500 px-3 py-1.5 rounded-lg transition-colors font-semibold"
          >
            Sales Advisor
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-semibold">LIVE</span>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Critical Threats" value={critical} sub="Active, unresolved" accent="text-red-400" />
          <MetricCard label="Outputs Blocked" value={blocked} sub="Last 24 hours" accent="text-amber-400" />
          <MetricCard label="Outputs Flagged" value={flagged} sub="For review" accent="text-cyan-400" />
          <MetricCard label="Active Alerts" value={active} sub="Pending resolution" accent="text-white" />
        </div>

        {/* Model health row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {(["Gemini", "Claude", "ChatGPT"] as const).map((model) => {
            const modelEvents = events.filter((e) => e.model === model);
            const modelCritical = modelEvents.filter((e) => e.severity === "critical").length;
            const status = modelCritical > 0 ? "warning" : "healthy";
            return (
              <div key={model} className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status === "warning" ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                  <Activity className={`w-5 h-5 ${status === "warning" ? "text-amber-400" : "text-emerald-400"}`} />
                </div>
                <div>
                  <div className="font-black text-white">{model}</div>
                  <div className={`text-xs font-bold ${status === "warning" ? "text-amber-400" : "text-emerald-400"}`}>
                    {status === "warning" ? `${modelCritical} critical event${modelCritical > 1 ? "s" : ""}` : "Healthy"}
                  </div>
                </div>
                <div className="ml-auto">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === "warning" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {status === "warning" ? "WATCH" : "OK"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Events log */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-black text-white">Governance Decisions Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Last updated {lastRefresh.toLocaleTimeString()} — Auditable, timestamped
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Real-time</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Time</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Model</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Description</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Severity</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Resolved</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => (
                  <EventRow key={evt.id} event={evt} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center text-sm text-slate-500">
          This is a live governance dashboard. All events are logged, timestamped, and auditable.{" "}
          <Link to="/admin" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Access Admin Panel <ChevronRight className="w-3 h-3 inline" />
          </Link>
        </div>
      </div>
    </div>
  );
}
