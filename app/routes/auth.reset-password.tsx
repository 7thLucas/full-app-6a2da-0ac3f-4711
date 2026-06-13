import { redirect } from "react-router";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AuthService } from "~/modules/authentication/authentication.service";
import { ResetPasswordCard } from "~/modules/authentication";

export async function loader({ request }: LoaderFunctionArgs) {
  if (getUserFromRequest(request)) return redirect("/");
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return redirect("/auth/forgot-password");
  return { token };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  try {
    await AuthService.resetPassword({
      token: String(formData.get("token") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });
    return redirect("/auth/login");
  } catch (error: any) {
    return { error: error.message ?? "Reset failed. The link may have expired." };
  }
}

export default function ResetPasswordRoute() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">ISI NEXUS</span>
          <h1 className="text-2xl font-black text-white mt-2">Set new password</h1>
        </div>
        <ResetPasswordCard />
      </div>
    </div>
  );
}
