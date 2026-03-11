"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

// PUBLIC_INTERFACE
export default function LoginPage() {
  /** Login screen. */
  const router = useRouter();
  const { isAuthed } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthed) router.replace("/notes");
  }, [isAuthed, router]);

  const loginMutation = useMutation({
    mutationFn: () => api.login({ username, password }),
    onSuccess: () => {
      setError(null);
      router.push("/notes");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Login failed"),
  });

  return (
    <main className="nm-container">
      <section className="nm-card p-6 max-w-xl mx-auto mt-10">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight">Sign in</h1>
          <p className="mt-2 text-sm text-[color:var(--nm-muted)]">
            Use your account to access your notes.
          </p>
        </header>

        <form
          className="mt-6 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            loginMutation.mutate();
          }}
        >
          <label className="grid gap-1">
            <span className="text-sm font-semibold">Username</span>
            <input
              className="nm-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">Password</span>
            <input
              className="nm-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? (
            <div className="nm-card p-3 border border-red-500/20 bg-red-500/5 text-sm text-[color:var(--nm-danger)]">
              {error}
            </div>
          ) : null}

          <button
            className="nm-btn nm-btn-primary"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-xs text-[color:var(--nm-muted)]">
            Placeholder endpoint: <code>/auth/login</code>. If backend is not ready, login will fail.
          </p>

          <p className="text-sm">
            No account?{" "}
            <Link className="nm-link" href="/auth/register">
              Create one
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
