"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20);
}

// PUBLIC_INTERFACE
export default function NoteEditPage() {
  /** Note editor. */
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

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tagsRaw, setTagsRaw] = React.useState("");

  React.useEffect(() => {
    if (!noteQuery.data) return;
    setTitle(noteQuery.data.title || "");
    setContent(noteQuery.data.content || "");
    setTagsRaw((noteQuery.data.tags || []).join(", "));
  }, [noteQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.updateNote(id, {
        title,
        content,
        tags: parseTags(tagsRaw),
      }),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", id] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      router.push(`/notes/${encodeURIComponent(note.id)}`);
    },
  });

  return (
    <AppShell>
      <section className="nm-card p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight">Edit note</h1>
            <p className="mt-1 text-sm text-[color:var(--nm-muted)]">
              Tags are comma-separated.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link className="nm-btn" href={`/notes/${encodeURIComponent(id)}`}>
              Cancel
            </Link>
            <button
              className="nm-btn nm-btn-primary"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || noteQuery.isLoading}
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {noteQuery.isError ? (
          <div className="mt-4 nm-card p-4 border border-red-500/20 bg-red-500/5">
            <p className="font-bold text-[color:var(--nm-danger)]">Editor unavailable</p>
            <p className="mt-1 text-sm text-[color:var(--nm-muted)]">
              Placeholder endpoints: <code>/notes/:id</code>, <code>/notes/:id</code> (PUT).
            </p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-semibold">Title</span>
            <input
              className="nm-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">Tags</span>
            <input
              className="nm-input"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="e.g. work, ideas, urgent"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {parseTags(tagsRaw).map((t) => (
                <span key={t} className="nm-chip">
                  {t}
                </span>
              ))}
            </div>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">Content</span>
            <textarea
              className="nm-input"
              style={{ minHeight: 280 }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note…"
            />
          </label>
        </div>
      </section>
    </AppShell>
  );
}
