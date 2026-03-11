"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";
import { api, Note } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

function NoteRow({ note }: { note: Note }) {
  return (
    <Link
      href={`/notes/${encodeURIComponent(note.id)}`}
      className="block nm-card p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-bold truncate">
            {note.title?.trim() ? note.title : "Untitled note"}
          </h3>
          <p className="mt-1 text-sm text-[color:var(--nm-muted)] line-clamp-2">
            {note.content?.trim() ? note.content : "No content"}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {note.tags?.slice(0, 4).map((t) => (
            <span key={t} className="nm-chip">
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// PUBLIC_INTERFACE
export default function NotesListPage() {
  /** Notes list with search and tag filtering. */
  const { isAuthed } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();

  const [q, setQ] = React.useState(params.get("q") || "");
  const selectedTag = params.get("tag") || "";

  React.useEffect(() => {
    if (!isAuthed) router.replace("/auth/login");
  }, [isAuthed, router]);

  const notesQuery = useQuery({
    queryKey: ["notes", { q: params.get("q") || "", tag: selectedTag || "" }],
    queryFn: () => api.listNotes({ q: params.get("q") || "", tag: selectedTag || "" }),
    enabled: isAuthed,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createNote({ title: "New note", content: "", tags: selectedTag ? [selectedTag] : [] }),
    onSuccess: (note) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push(`/notes/${encodeURIComponent(note.id)}/edit`);
    },
  });

  function applySearch() {
    const usp = new URLSearchParams(params.toString());
    if (q.trim()) usp.set("q", q.trim());
    else usp.delete("q");
    router.push(`/notes?${usp.toString()}`);
  }

  return (
    <AppShell>
      <section className="nm-card p-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Your notes</h1>
            <p className="mt-1 text-sm text-[color:var(--nm-muted)]">
              Search, filter by tag, and open a note to view or edit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="nm-btn nm-btn-primary"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating…" : "New note"}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-2">
          <input
            className="nm-input"
            placeholder="Search notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") applySearch();
            }}
          />
          <button className="nm-btn" onClick={applySearch}>
            Search
          </button>
          <Link className="nm-btn" href="/notes">
            Reset
          </Link>
        </div>

        {selectedTag ? (
          <div className="mt-3">
            <span className="nm-chip nm-chip-active">Filtering tag: {selectedTag}</span>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3">
          {notesQuery.isLoading ? (
            <p className="text-sm text-[color:var(--nm-muted)]">Loading notes…</p>
          ) : notesQuery.isError ? (
            <div className="nm-card p-4 border border-red-500/20 bg-red-500/5">
              <p className="font-bold text-[color:var(--nm-danger)]">Notes unavailable</p>
              <p className="mt-1 text-sm text-[color:var(--nm-muted)]">
                Backend endpoints are wired as placeholders (<code>/notes</code>). Configure{" "}
                <code>NEXT_PUBLIC_API_BASE_URL</code> and implement backend routes to enable data.
              </p>
            </div>
          ) : notesQuery.data.length === 0 ? (
            <div className="nm-card p-4">
              <p className="font-bold">No notes yet</p>
              <p className="mt-1 text-sm text-[color:var(--nm-muted)]">
                Create your first note to get started.
              </p>
            </div>
          ) : (
            notesQuery.data.map((n) => <NoteRow key={n.id} note={n} />)
          )}
        </div>
      </section>
    </AppShell>
  );
}
