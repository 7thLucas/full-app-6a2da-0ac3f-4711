import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { ForgotPasswordCard } from "~/modules/authentication";

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try { await AuthService.forgotPassword(String(formData.get("email") ?? "")); } catch {}
  return { success: true, message: "If that email exists, a reset link has been sent. Check your inbox." };
}

export default function ForgotPasswordRoute() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">ISI NEXUS</span>
          <h1 className="text-2xl font-black text-white mt-2">Reset your password</h1>
        </div>
        <ForgotPasswordCard />
      </div>
    </div>
  );
}
