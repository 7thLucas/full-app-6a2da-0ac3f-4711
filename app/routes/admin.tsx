import { Link, useLoaderData, Form, useNavigation, useActionData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { useState } from "react";
import { Shield, Search, Filter, Plus, ChevronRight, Users, Activity, Key, DollarSign, RefreshCw, Check, X } from "lucide-react";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { useConfigurables } from "~/modules/configurables";

// ─── Server ───────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return redirect("/auth/login");
  }
  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    return redirect("/auth/login");
  }
  const fd = await request.formData();
  const intent = String(fd.get("intent") ?? "");

  if (intent === "update-status") {
    const clientId = String(fd.get("clientId") ?? "");
    const status = String(fd.get("status") ?? "");
    // In production, update DB. For now return success.
    return { success: true, message: `Client ${clientId} status updated to ${status}` };
  }

  return { success: false };
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockClients = [
  {
    id: "cl-001",
    companyName: "Meridian Financial Group",
    contactName: "Sarah Chen",
    contactEmail: "s.chen@meridianfg.com",
    licenseTier: "enterprise",
    status: "active",
    geminiConnected: true,
    claudeConnected: true,
    openaiConnected: true,
    governanceCalls: 847293,
    threatsBlocked: 1243,
    monthlyRevenue: 8500,
    joinedAt: "2024-11-15",
  },
  {
    id: "cl-002",
    companyName: "NovaTech AI Solutions",
    contactName: "Marcus Webb",
    contactEmail: "m.webb@novatech.ai",
    licenseTier: "white-label",
    status: "active",
    geminiConnected: true,
    claudeConnected: false,
    openaiConnected: true,
    governanceCalls: 2143789,
    threatsBlocked: 3891,
    monthlyRevenue: 45000,
    joinedAt: "2024-09-03",
  },
  {
    id: "cl-003",
    companyName: "Axiom Healthcare Systems",
    contactName: "Dr. Priya Nair",
    contactEmail: "p.nair@axiomhealth.com",
    licenseTier: "enterprise",
    status: "trial",
    geminiConnected: false,
    claudeConnected: true,
    openaiConnected: true,
    governanceCalls: 12847,
    threatsBlocked: 47,
    monthlyRevenue: 0,
    joinedAt: "2026-06-01",
  },
  {
    id: "cl-004",
    companyName: "Strata Legal Tech",
    contactName: "James Okafor",
    contactEmail: "j.okafor@stratalegal.com",
    licenseTier: "professional",
    status: "active",
    geminiConnected: true,
    claudeConnected: true,
    openaiConnected: false,
    governanceCalls: 234876,
    threatsBlocked: 891,
    monthlyRevenue: 2500,
    joinedAt: "2025-02-20",
  },
  {
    id: "cl-005",
    companyName: "Quantum Logistics Corp",
    contactName: "Aisha Patel",
    contactEmail: "a.patel@qlcorp.com",
    licenseTier: "professional",
    status: "suspended",
    geminiConnected: false,
    claudeConnected: false,
    openaiConnected: true,
    governanceCalls: 45123,
    threatsBlocked: 89,
    monthlyRevenue: 0,
    joinedAt: "2025-05-11",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const tierBadge: Record<string, string> = {
  professional: "bg-slate-700 text-slate-300",
  enterprise: "bg-cyan-500/20 text-cyan-400",
  "white-label": "bg-amber-500/20 text-amber-400",
};

const statusBadge: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  trial: "bg-cyan-500/20 text-cyan-400",
  suspended: "bg-red-500/20 text-red-400",
  inactive: "bg-slate-700 text-slate-400",
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { config, loading } = useConfigurables();
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedClient, setSelectedClient] = useState<(typeof mockClients)[0] | null>(null);

  const appName = loading ? "ISI Nexus" : (config?.appName ?? "ISI Nexus");
  const logoUrl = loading ? "" : (config?.logoUrl ?? "");

  const filtered = mockClients.filter((c) => {
    const matchSearch =
      search === "" ||
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(search.toLowerCase());
    const matchTier = filterTier === "all" || c.licenseTier === filterTier;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchTier && matchStatus;
  });

  const totalMRR = mockClients.reduce((sum, c) => sum + c.monthlyRevenue, 0);
  const activeClients = mockClients.filter((c) => c.status === "active").length;
  const totalGovernanceCalls = mockClients.reduce((sum, c) => sum + c.governanceCalls, 0);
  const totalThreats = mockClients.reduce((sum, c) => sum + c.threatsBlocked, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            {logoUrl && logoUrl !== "FILL_LOGO_URL_HERE" ? (
              <img src={logoUrl} alt={appName} className="h-7 w-7 object-contain" />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <span className="font-black text-white">{appName}</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden md:block">{user?.email}</span>
          <Link
            to="/dashboard"
            className="text-slate-400 hover:text-white text-xs border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Dashboard
          </Link>
          <Form method="post" action="/auth/logout" className="inline">
            <button className="text-xs text-slate-400 hover:text-white transition-colors">Sign Out</button>
          </Form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Monthly Revenue", value: `$${totalMRR.toLocaleString()}`, icon: DollarSign, accent: "text-cyan-400" },
            { label: "Active Clients", value: activeClients, icon: Users, accent: "text-emerald-400" },
            { label: "Governance Calls", value: formatNumber(totalGovernanceCalls), icon: Activity, accent: "text-white" },
            { label: "Threats Blocked", value: formatNumber(totalThreats), icon: Shield, accent: "text-amber-400" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-slate-900 rounded-2xl border border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{m.label}</span>
                </div>
                <div className={`text-3xl font-black ${m.accent}`}>{m.value}</div>
              </div>
            );
          })}
        </div>

        {actionData?.success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm">{actionData.message}</span>
          </div>
        )}

        {/* Client table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="font-black text-white flex-1">Client Accounts</h2>
            <div className="flex gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg pl-8 pr-4 py-2 text-xs focus:outline-none focus:border-cyan-500 w-48 transition-colors"
                />
              </div>
              {/* Tier filter */}
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
              >
                <option value="all">All Tiers</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
                <option value="white-label">White-Label</option>
              </select>
              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Company</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tier</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:table-cell">Models</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Calls</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 hidden lg:table-cell">MRR</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedClient(client)}
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white text-sm">{client.companyName}</div>
                      <div className="text-xs text-slate-500">{client.contactEmail}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${tierBadge[client.licenseTier]}`}>
                        {client.licenseTier}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusBadge[client.status]}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="flex gap-1">
                        {client.geminiConnected && <span className="text-xs bg-slate-700 text-cyan-400 px-1.5 py-0.5 rounded">G</span>}
                        {client.claudeConnected && <span className="text-xs bg-slate-700 text-amber-400 px-1.5 py-0.5 rounded">C</span>}
                        {client.openaiConnected && <span className="text-xs bg-slate-700 text-emerald-400 px-1.5 py-0.5 rounded">O</span>}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-300">{formatNumber(client.governanceCalls)}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className={`text-sm font-black ${client.monthlyRevenue > 0 ? "text-cyan-400" : "text-slate-500"}`}>
                        {client.monthlyRevenue > 0 ? `$${client.monthlyRevenue.toLocaleString()}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                      No clients match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Client detail panel */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-white">{selectedClient.companyName}</h3>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Contact", value: selectedClient.contactName },
                  { label: "Email", value: selectedClient.contactEmail },
                  { label: "License Tier", value: selectedClient.licenseTier },
                  { label: "Status", value: selectedClient.status },
                  { label: "Governance Calls", value: formatNumber(selectedClient.governanceCalls) },
                  { label: "Threats Blocked", value: selectedClient.threatsBlocked },
                  { label: "Monthly Revenue", value: selectedClient.monthlyRevenue > 0 ? `$${selectedClient.monthlyRevenue.toLocaleString()}` : "—" },
                  { label: "Member Since", value: selectedClient.joinedAt },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{item.label}</div>
                    <div className="text-sm text-white">{item.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Connected Models</div>
                <div className="flex gap-2">
                  {["Gemini", "Claude", "ChatGPT"].map((model, i) => {
                    const connected = [selectedClient.geminiConnected, selectedClient.claudeConnected, selectedClient.openaiConnected][i];
                    return (
                      <div key={model} className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${connected ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                        {connected ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {model}
                      </div>
                    );
                  })}
                </div>
              </div>

              <Form method="post" className="space-y-3">
                <input type="hidden" name="intent" value="update-status" />
                <input type="hidden" name="clientId" value={selectedClient.id} />
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Update Status</label>
                  <div className="flex gap-2">
                    {["active", "suspended", "inactive"].map((s) => (
                      <button
                        key={s}
                        type="submit"
                        name="status"
                        value={s}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-colors ${
                          selectedClient.status === s
                            ? "bg-cyan-500 text-white"
                            : "border border-slate-700 text-slate-300 hover:border-slate-500"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
