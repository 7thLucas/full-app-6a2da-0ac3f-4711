import { Link, Form, useActionData, useNavigation } from "react-router";
import type { ActionFunctionArgs } from "react-router";
import { Shield, Check, ArrowRight } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { EmailService } from "@qb/email";

export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const companyName = String(fd.get("companyName") ?? "");
  const companySize = String(fd.get("companySize") ?? "");
  const aiTools = String(fd.get("aiTools") ?? "");
  const primaryConcern = String(fd.get("primaryConcern") ?? "");
  const name = String(fd.get("name") ?? "");
  const email = String(fd.get("email") ?? "");
  const phone = String(fd.get("phone") ?? "");

  if (!companyName || !email || !name) {
    return { error: "Please fill in all required fields." };
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL ?? process.env.SMTP_FROM ?? "admin@isinexus.com";
    await EmailService.sendEmail({
      to: adminEmail,
      subject: `New ISI Nexus Demo Request — ${companyName}`,
      content: `
New demo request received:

Company: ${companyName}
Company Size: ${companySize}
AI Tools in Use: ${aiTools}
Primary Concern: ${primaryConcern}

Contact Name: ${name}
Contact Email: ${email}
Contact Phone: ${phone}
      `.trim(),
    });

    // Confirmation to the requestor
    await EmailService.sendEmail({
      to: email,
      subject: "Your ISI Nexus Demo Request — Confirmed",
      content: `
Thank you, ${name}.

Your demo request for ISI Nexus has been received. Our enterprise team will contact you within 24 hours to schedule your session.

What to expect:
- 30-minute technical walkthrough of the ISI Nexus governance architecture
- Live demonstration of multi-model contradiction detection
- Custom ROI analysis for ${companyName}
- Q&A with our governance engineering team

In the meantime, review our architecture at https://isinexus.com.

— The ISI Nexus Team
      `.trim(),
    });
  } catch (e) {
    // Email failure is non-fatal — still show success
  }

  return {
    success: true,
    name,
    email,
    companyName,
  };
}

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
        <Link to="/pricing" className="text-slate-400 hover:text-white text-sm transition-colors">
          Pricing
        </Link>
      </div>
    </nav>
  );
}

export default function DemoPage() {
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

      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Info */}
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">Book a Demo</span>
            <h1 className="text-4xl md:text-5xl font-black text-white mt-3 leading-tight">
              See ISI Nexus in Action
            </h1>
            <p className="text-slate-400 mt-4 leading-relaxed">
              Schedule a 30-minute live demonstration with our enterprise governance team. We'll walk you through the three-layer architecture, show you live threat detection, and build a custom ROI model for your organization.
            </p>

            <div className="mt-10 space-y-6">
              {[
                {
                  step: "01",
                  title: "Submit your request",
                  desc: "Fill in your company context so we can tailor the demonstration to your exact AI deployment.",
                },
                {
                  step: "02",
                  title: "Schedule in 24 hours",
                  desc: "Our enterprise team contacts you within one business day to confirm a time.",
                },
                {
                  step: "03",
                  title: "Live technical walkthrough",
                  desc: "See the governance system operating against real AI outputs — including multi-model contradiction detection and drift monitoring.",
                },
                {
                  step: "04",
                  title: "Custom ROI analysis",
                  desc: "We build a quantified risk model specific to your industry, AI tools, and scale of deployment.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <span className="text-3xl font-black text-slate-800 flex-shrink-0 w-10">{item.step}</span>
                  <div>
                    <h3 className="font-black text-white mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form or Confirmation */}
          <div>
            {actionData?.success ? (
              <div className="bg-slate-900 rounded-2xl border border-emerald-500/30 p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-black text-white mb-3">Request Received</h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Thank you, <span className="text-white font-semibold">{actionData.name}</span>. Our enterprise team will contact you at <span className="text-cyan-400">{actionData.email}</span> within 24 hours to schedule your {appName} demonstration.
                </p>
                <div className="bg-slate-800 rounded-xl p-4 text-left mb-8">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">What's next</div>
                  <ul className="space-y-2">
                    {[
                      "Check your inbox for a confirmation email",
                      "A governance engineer will reach out within 1 business day",
                      "We'll prepare a custom demo tailored to your AI stack",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                >
                  Return to homepage
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
                <h2 className="font-black text-white text-xl mb-6">Request a Demo</h2>
                {actionData?.error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                    <p className="text-red-400 text-sm">{actionData.error}</p>
                  </div>
                )}
                <Form method="post" className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="name"
                        type="text"
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
                      type="text"
                      required
                      placeholder="Acme Corporation"
                      className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Company Size
                      </label>
                      <select
                        name="companySize"
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                      >
                        <option value="">Select size</option>
                        <option value="50-200">50–200 employees</option>
                        <option value="200-1000">200–1,000 employees</option>
                        <option value="1000-5000">1,000–5,000 employees</option>
                        <option value="5000+">5,000+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Phone
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      AI Tools Currently in Use
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["ChatGPT / OpenAI", "Claude / Anthropic", "Gemini / Google", "Other"].map((tool) => (
                        <label key={tool} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="aiTools" value={tool} className="accent-cyan-500" />
                          <span className="text-sm text-slate-300">{tool}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Primary Concern
                    </label>
                    <select
                      name="primaryConcern"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    >
                      <option value="">Select your primary concern</option>
                      <option value="hallucinations">Hallucinations in production outputs</option>
                      <option value="drift">AI model drift over time</option>
                      <option value="compliance">Regulatory compliance and auditability</option>
                      <option value="unauthorized">Unauthorized AI actions</option>
                      <option value="contradictions">Multi-model contradictions</option>
                      <option value="general">General AI governance</option>
                    </select>
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
                        Request Demo
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
    </div>
  );
}
