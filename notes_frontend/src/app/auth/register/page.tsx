"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

// PUBLIC_INTERFACE
export default function RegisterPage() {
  /** Registration screen. */
  const router = useRouter();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: () => api.register({ username, password }),
    onSuccess: () => {
      setError(null);
      router.push("/auth/login");
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Registration failed"),
  });

  return (
    <main className="nm-container">
      <section className="nm-card p-6 max-w-xl mx-auto mt-10">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight">Create account</h1>
          <p className="mt-2 text-sm text-[color:var(--nm-muted)]">
            Register to start creating notes.
          </p>
        </header>

        <form
          className="mt-6 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            registerMutation.mutate();
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
              autoComplete="new-password"
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
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? "Creating…" : "Create account"}
          </button>

          <p className="text-xs text-[color:var(--nm-muted)]">
            Placeholder endpoint: <code>/auth/register</code>.
          </p>

          <p className="text-sm">
            Already have an account?{" "}
            <Link className="nm-link" href="/auth/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
