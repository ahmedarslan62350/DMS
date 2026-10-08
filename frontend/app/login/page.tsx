"use client";

import * as React from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthMutations } from "@/tanstack/Mutations/authMutations";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TokenStorage } from "@/lib/helpers";

/** Real, shipped capabilities — not invented marketing copy. */
const capabilities = [
  { index: "01", label: "Company registry", detail: "Servers, links and credentials" },
  { index: "02", label: "Renewal alerts", detail: "Deadlines before they lapse" },
  { index: "03", label: "Monthly charges", detail: "Billed, collected and pending" },
  { index: "04", label: "Audit history", detail: "Every field change, attributed" },
];

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const loginMutation = useMemoisedLogin(queryClient);

  /*
   * Redirect on success — driven by the mutation result, not by a synchronous
   * read of `loginMutation.data` immediately after `mutate()`. That read was
   * always `undefined`, which is why signing in previously did nothing.
   */
  React.useEffect(() => {
    if (loginMutation.isSuccess && TokenStorage.get()) {
      router.replace("/dashboard");
    }
  }, [loginMutation.isSuccess, router]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFieldError("Enter both your email address and password.");
      return;
    }

    setFieldError(null);
    loginMutation.mutate({ email: trimmedEmail, password });
  };

  const errorMessage = fieldError
    ? fieldError
    : loginMutation.isError
      ? getApiErrorMessage(loginMutation.error)
      : null;

  const isPending = loginMutation.isPending;

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_1fr]">
      {/* ---------------- Ink panel: identity + orientation ---------------- */}
      <aside className="hidden flex-col justify-between bg-rail p-12 lg:flex xl:p-16">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center rounded-[3px] bg-white font-mono text-[11px] leading-none font-bold text-[#0b0b0d]">
            DF
          </span>
          <span className="flex flex-col">
            <span className="text-[15px] leading-tight font-semibold tracking-[-0.02em] text-white">
              DialerFlow
            </span>
            <span className="rail-label">Management Portal</span>
          </span>
        </div>

        <div className="max-w-xl">
          <h2 className="display-2 text-white">
            Everything your dialer
            <br />
            accounts depend on,
            <br />
            in one register.
          </h2>

          <p className="body-lg mt-6 max-w-md text-rail-muted">
            Track each company&apos;s servers, charges and renewal dates.
            Every change is written to an attributed audit trail.
          </p>

          <ul className="mt-12 border-t border-rail-border">
            {capabilities.map((item) => (
              <li
                key={item.index}
                className="flex items-baseline gap-5 border-b border-rail-border py-4"
              >
                <span className="mono-id text-rail-muted">{item.index}</span>
                <span className="flex flex-col">
                  <span className="text-[13px] font-medium text-white">
                    {item.label}
                  </span>
                  <span className="text-[12px] text-rail-muted">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="rail-label">
          Authorised personnel only · Access is provisioned by an administrator
        </p>
      </aside>

      {/* ---------------- Form panel ---------------- */}
      <main className="relative flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          {/* Compact wordmark, mobile only — the ink panel is hidden here */}
          <span className="flex items-center gap-2.5 lg:invisible">
            <span className="flex size-6 items-center justify-center rounded-[3px] bg-foreground font-mono text-[10px] leading-none font-bold text-background">
              DF
            </span>
            <span className="text-[13px] font-semibold tracking-[-0.02em] text-foreground">
              DialerFlow
            </span>
          </span>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {theme === "dark" ? (
              <Sun className="size-[18px]" />
            ) : (
              <Moon className="size-[18px]" />
            )}
          </button>
        </div>

        <div className="flex flex-1 items-center px-6 pb-16 sm:px-10">
          <div className="w-full max-w-[26rem]">
            <p className="micro-label">Secure sign in</p>
            <h1 className="heading-1 mt-3 text-foreground">
              Sign in to the portal
            </h1>
            <p className="body mt-2 text-muted-foreground">
              Use the credentials issued by your administrator.
            </p>

            <form onSubmit={onSubmit} noValidate className="mt-9 space-y-5">
              {errorMessage && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/8 px-3.5 py-3"
                >
                  <AlertCircle className="mt-px size-4 shrink-0 text-destructive" />
                  <p className="body-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isPending}
                    aria-invalid={!!errorMessage}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                    aria-invalid={!!errorMessage}
                    className="pr-10 pl-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-[4px] p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="w-full"
              >
                {isPending ? "Signing in…" : "Sign in"}
                {!isPending && <ArrowRight className="size-4" />}
              </Button>
            </form>

            <div className="rule mt-9" />
            <p className="body-sm mt-5 text-muted-foreground">
              Don&apos;t have an account? Access is granted by an administrator —
              contact yours to be provisioned.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * `AuthMutations.login(queryClient)` builds a fresh options object on every
 * render, which makes `useMutation` re-register needlessly. Memoising keeps
 * the mutation identity stable for the life of the page.
 */
function useMemoisedLogin(queryClient: ReturnType<typeof useQueryClient>) {
  const options = React.useMemo(
    () => AuthMutations.login(queryClient),
    [queryClient],
  );

  return useMutation(options);
}
