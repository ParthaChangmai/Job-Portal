import { redirect } from "next/navigation";

import { SignInForm } from "@/components/forms/sign-in-form";
import { getCurrentSession } from "@/lib/auth/session";

export default async function SignInPage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return <SignInForm githubEnabled={Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET)} />;
}
