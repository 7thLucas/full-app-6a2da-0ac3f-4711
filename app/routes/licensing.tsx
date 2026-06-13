import { Link, Form, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Shield, Check, ArrowRight, Code2 } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { EmailService } from "@qb/email";

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const companyName = String(fd.get("companyName") ?? "");
  const email = String(fd.get("email") ?? "");
  const name = String(fd.get("name") ?? "");
  const licenseType = String(fd.get("licenseType") ?? "");
  const useCase = String(fd.get("useCase") ?? "");

  if (!companyName || !email || !name) {
    return { error: "Please fill in all required fields." };
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? process.env.SMTP_FROM ?? "admin@isinexus.com";
    await EmailService.sendEmail({
      to: adminEmail,
      subject: `New ISI Nexus Licensing Inquiry — ${licenseType} — ${companyName}`,
      content: `
New licensing inquiry received:

License Type: ${licenseType}
Company: ${companyName}
Contact: ${name} <${email}>
Use Case: ${useCase}
      `.trim(),
    });
  } catch {}

  return { success: true, name, licenseType };
}

const licenseTiers = [
  {
    name: "Standard License",
    price: "$15,000",
    period: "per deployment / year",
    description: "Embed the ISI governance engine in your product or service. Single deployment, full governance stack.",
    features: [
      "Full ISI engine API access",
      "All 6 threat vector coverage",
      "Up to 1M governance calls/month",
      "Standard SLA",
      "Technical onboarding",
      "Logo: 'Powered by ISI Nexus'",
    ],
    highlighted: false,
  },
  {
    name: "Enterprise License",
    price: "$45,000",
    period: "per deployment / year",
    description: "Multi-deployment licensing with unlimited scale, dedicated support, and custom governance policy authoring.",
    features: [
      "Unlimited ISI engine deployments",
      "Unlimited governance calls",
      "Custom governance policy configuration",
      "Priority SLA (2hr response)",
      "Dedicated integration engineer",
      "Quarterly governance review",
      "Logo: 'Powered by ISI Nexus'",
    ],
    highlighted: true,
  },
  {
    name: "White-Label License",
    price: "Custom",
    period: "annual agreement",
    description: "Deploy ISI Nexus under your own brand. Full rebrand rights, no ISI attribution required. Ideal for AI integrators and platform vendors.",
    features: [
      "Full white-label rights",
      "Custom branding and domain",
      "Revenue share options available",
      "All enterprise license features",
      "Joint GTM support",
      "Source code escrow available",
      "Custom legal agreement",
    ],
    highlighted: false,
  },
];

function Nav({ appName, logoUrl }: { appName: string; logoUrl: string }) {
  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {logoUrl && logoUrl !== "FILL_LOGO_URL_HERE" ? (
            <img src={logoUrl} alt={appName} className="h-8 w-8 object-contain" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-black text-white text-lg">{appName}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</Link>
          <Link to="/demo" className="bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Book a Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function LicensingPage() {
  const { config, loading } = useConfigurables();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const appName = config?.appName ?? "ISI Nexus";
  const logoUrl = config?.logoUrl ?? "";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Nav appName={appName} logoUrl={logoUrl} />

      <div className="max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Licensing</span>
          <h1 className="text-5xl md:text-6xl font-black text-white mt-3 leading-none">
            Embed AI Governance in Your Product
          </h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
            License the ISI Nexus engine and deliver enterprise-grade AI governance as part of your own platform. Available as standard, enterprise, or white-label.
          </p>
        </div>

        {/* Use cases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: Code2,
              title: "AI Platform Builders",
              desc: "Add governance as a native feature to your AI platform. Differentiate with auditable, policy-enforced AI outputs.",
            },
            {
              icon: Shield,
              title: "Compliance Software Vendors",
              desc: "Extend your compliance product with real-time AI governance. Sell to regulated industries where AI oversight is mandated.",
            },
            {
              icon: ArrowRight,
              title: "Systems Integrators",
              desc: "Resell ISI Nexus under your own brand to enterprise clients. White-label removes all ISI attribution.",
            },
          ].map((uc) => {
            const Icon = uc.icon;
            return (
              <div key={uc.title} className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <Icon className="w-6 h-6 text-cyan-400 mb-4" />
                <h3 className="font-black text-white mb-2">{uc.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{uc.desc}</p>
              </div>
            );
          })}
        </div>

        {/* License tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {licenseTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl border p-8 flex flex-col relative ${
                tier.highlighted
                  ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-slate-900"
                  : "border-slate-800 bg-slate-900"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-cyan-500 text-white text-xs font-black px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-black text-white mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{tier.price}</span>
                </div>
                <span className="text-slate-400 text-xs">{tier.period}</span>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{tier.description}</p>
              </div>
              <div className="flex-1 space-y-3 mb-8">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
              <a
                href="#inquiry"
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  tier.highlighted
                    ? "bg-cyan-500 hover:bg-cyan-400 text-white"
                    : "border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white"
                }`}
              >
                Inquire
              </a>
            </div>
          ))}
        </div>

        {/* Inquiry form */}
        <div id="inquiry" className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-white">License Inquiry</h2>
            <p className="text-slate-400 mt-2">Our licensing team will respond within 1 business day.</p>
          </div>

          {actionData?.success ? (
            <div className="bg-slate-900 rounded-2xl border border-emerald-500/30 p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
                <Check className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Inquiry Received</h3>
              <p className="text-slate-400">
                Thank you, <span className="text-white font-semibold">{actionData.name}</span>. Our licensing team will follow up within 1 business day regarding your{" "}
                <span className="text-cyan-400">{actionData.licenseType}</span> inquiry.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
              {actionData?.error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                  <p className="text-red-400 text-sm">{actionData.error}</p>
                </div>
              )}
              <Form method="post" className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="name"
                      required
                      placeholder="Jane Smith"
                      className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Work Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="jane@company.com"
                      className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="companyName"
                    required
                    placeholder="Acme Corporation"
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    License Type
                  </label>
                  <select
                    name="licenseType"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="standard">Standard License — $15,000/year</option>
                    <option value="enterprise">Enterprise License — $45,000/year</option>
                    <option value="white-label">White-Label License — Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Describe Your Use Case
                  </label>
                  <textarea
                    name="useCase"
                    rows={3}
                    placeholder="How do you plan to embed or deploy the ISI Nexus engine?"
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Licensing Inquiry
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
