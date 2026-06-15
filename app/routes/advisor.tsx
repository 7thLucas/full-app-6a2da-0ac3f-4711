import { Link, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { Shield } from "lucide-react";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { AdvisorChat } from "~/modules/agentic/advisor/components/advisor-chat";
import { ConsoleIntro } from "~/modules/agentic/advisor/components/console-intro";

// ─── Server: auth + subscription gating ──────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  const jwtUser = getUserFromRequest(request);
  if (!jwtUser) {
    return redirect("/auth/login?redirect=/advisor");
  }

  // Admins always pass. Otherwise check the real subscription flag from the DB
  // (the JWT payload does not carry the extensible profile bag).
  if (jwtUser.role !== "admin") {
    const fullUser = await AuthService.getUserById(jwtUser.id);
    const sub = (fullUser?.profile as Record<string, any> | undefined)?.subscription;
    const active = sub?.active === true || sub?.status === "active";
    if (!active) {
      return redirect("/pricing");
    }
  }

  // Optional owner-supplied presenter video for the console intro.
  const presenterVideoUrl = process.env.ISI_ADVISOR_VIDEO_URL || null;

  return { email: jwtUser.email, presenterVideoUrl };
}

// ─── Page: video-led enterprise security console (not a chatbot) ─────────────

export default function AdvisorPage() {
  const { email, presenterVideoUrl } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-black text-white">ISI Nexus</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sm text-slate-400">Security Console</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-slate-500 md:block">{email}</span>
          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="mb-5">
          <h1 className="text-2xl font-black text-white">ISI Nexus Governance Console</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            A live, video-led briefing where multiple AI models check and challenge each other in
            real time — and the ISI Judge ratifies one governed answer your board can defend.
          </p>
        </div>

        <div className="mb-6">
          <ConsoleIntro videoUrl={presenterVideoUrl} />
        </div>

        <AdvisorChat />
      </div>
    </div>
  );
}
