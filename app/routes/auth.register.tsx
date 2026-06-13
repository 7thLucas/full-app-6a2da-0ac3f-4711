import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserFromRequest, signJwt, buildAuthCookie } from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { RegisterCard } from "~/modules/authentication";

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    const user = await AuthService.register({
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    const token = signJwt({ sub: user.id, role: user.role, username: user.username, email: user.email, email_verified: user.email_verified ?? false });
    return redirect("/onboarding", { headers: { "Set-Cookie": buildAuthCookie(token, new URL(request.url).hostname) } });
  } catch (error: any) {
    return { error: error.message ?? "Registration failed" };
  }
}

export default function RegisterRoute() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">ISI NEXUS</span>
          <h1 className="text-2xl font-black text-white mt-2">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start your enterprise AI governance journey</p>
        </div>
        <RegisterCard />
      </div>
    </div>
  );
}
