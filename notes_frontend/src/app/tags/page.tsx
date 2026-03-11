"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

// PUBLIC_INTERFACE
export default function TagsPage() {
  /** Tag listing/management. */
  const { isAuthed } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!isAuthed) router.replace("/auth/login");
  }, [isAuthed, router]);

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.listTags(),
    enabled: isAuthed,
  });

  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");

  const renameMutation = useMutation({
    mutationFn: () => api.renameTag({ from, to }),
    onSuccess: () => {
      setFrom("");
      setTo("");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <AppShell>
      <section className="nm-card p-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Tags</h1>
          <p className="mt-1 text-sm text-[color:var(--nm-muted)]">
            View tags and (optionally) rename them.
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="nm-card p-4">
            <h2 className="font-bold">All tags</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {tagsQuery.isLoading ? (
                <span className="text-sm text-[color:var(--nm-muted)]">Loading…</span>
              ) : tagsQuery.isError ? (
                <span className="text-sm text-[color:var(--nm-danger)]">
                  Tags unavailable (placeholder endpoint: <code>/tags</code>)
                </span>
              ) : tagsQuery.data?.length ? (
                tagsQuery.data.map((t) => (
                  <span key={t.name} className="nm-chip">
                    {t.name}
                    {typeof t.count === "number" ? (
                      <span className="text-[color:var(--nm-muted)]">({t.count})</span>
                    ) : null}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[color:var(--nm-muted)]">No tags yet.</span>
              )}
            </div>
          </div>

          <div className="nm-card p-4">
            <h2 className="font-bold">Rename tag</h2>
            <p className="mt-1 text-sm text-[color:var(--nm-muted)]">
              Placeholder endpoint: <code>/tags/rename</code>.
            </p>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                className="nm-input"
                placeholder="From (old tag)"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <input
                className="nm-input"
                placeholder="To (new tag)"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <button
                className="nm-btn nm-btn-primary"
                onClick={() => renameMutation.mutate()}
                disabled={renameMutation.isPending || !from.trim() || !to.trim()}
              >
                {renameMutation.isPending ? "Renaming…" : "Rename"}
              </button>
            </div>

            {renameMutation.isError ? (
              <p className="mt-3 text-sm text-[color:var(--nm-danger)]">
                Rename failed (backend not ready).
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
