"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

// PUBLIC_INTERFACE
export default function NoteDetailPage() {
  /** Note detail view. */
  const { isAuthed } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();
  const id = params.id;

  React.useEffect(() => {
    if (!isAuthed) router.replace("/auth/login");
  }, [isAuthed, router]);

  const noteQuery = useQuery({
    queryKey: ["note", id],
    queryFn: () => api.getNote(id),
    enabled: isAuthed && Boolean(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/notes");
    },
  });

  return (
    <AppShell>
      <section className="nm-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight truncate">
              {noteQuery.data?.title?.trim() ? noteQuery.data.title : "Untitled note"}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {noteQuery.data?.tags?.map((t) => (
                <span key={t} className="nm-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link className="nm-btn" href="/notes">
              Back
            </Link>
            <Link className="nm-btn nm-btn-primary" href={`/notes/${encodeURIComponent(id)}/edit`}>
              Edit
            </Link>
            <button
              className="nm-btn nm-btn-danger"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        <div className="mt-5">
          {noteQuery.isLoading ? (
            <p className="text-sm text-[color:var(--nm-muted)]">Loading…</p>
          ) : noteQuery.isError ? (
            <div className="nm-card p-4 border border-red-500/20 bg-red-500/5">
              <p className="font-bold text-[color:var(--nm-danger)]">Note unavailable</p>
              <p className="mt-1 text-sm text-[color:var(--nm-muted)]">
                Placeholder endpoint: <code>/notes/:id</code>.
              </p>
            </div>
          ) : (
            <article className="prose max-w-none">
              <div className="whitespace-pre-wrap leading-7 text-[color:var(--nm-text)]">
                {noteQuery.data?.content?.trim() ? noteQuery.data.content : "No content."}
              </div>
            </article>
          )}
        </div>
      </section>
    </AppShell>
  );
}
