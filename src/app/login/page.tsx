import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { Wordmark } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1fr_minmax(420px,480px)]">
      {/* Brand panel: the navy rail, carrying the official wordmark. */}
      <section className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-fg lg:flex">
        <Wordmark onDark />

        <div className="max-w-md">
          <p className="text-[1.75rem] leading-[2.375rem] font-semibold tracking-tight">
            Your day, already prioritised.
          </p>
          <p className="mt-3 text-body leading-6 text-sidebar-fg-muted">
            Loan Factory CRM opens on what needs you now — the locks about to expire, the
            leads still waiting, the follow-ups AI has drafted for your approval.
          </p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-sidebar-border pt-6">
            {[
              { k: "Prioritised", v: "One queue" },
              { k: "Prepared", v: "AI drafts" },
              { k: "Approved", v: "By you" },
            ].map((item) => (
              <div key={item.k}>
                <dt className="text-label font-semibold uppercase tracking-wide text-sidebar-fg-muted">
                  {item.k}
                </dt>
                <dd className="mt-1 text-body font-semibold text-sidebar-fg">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-small text-sidebar-fg-dim">
          Loan Factory · NMLS #320841 · Equal Housing Opportunity
        </p>
      </section>

      <section className="flex flex-col justify-center bg-canvas px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="lg:hidden">
            <Wordmark />
          </div>

          <div className="mt-8 lg:mt-0">
            <h1 className="text-h1 font-semibold tracking-tight text-primary">Sign in</h1>
            <p className="mt-1 text-body text-secondary">
              Use your Loan Factory work account.
            </p>
          </div>

          <div className="mt-6">
            <LoginForm next={next} />
          </div>

          <p className="mt-6 text-small text-muted">
            Trouble signing in? Ask your team administrator to check your account.
          </p>

          <p className="mt-10 text-small text-muted lg:hidden">
            Loan Factory · NMLS #320841 · Equal Housing Opportunity
          </p>
        </div>
      </section>
    </main>
  );
}
