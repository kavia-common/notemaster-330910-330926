"use client";

import Link from "next/link";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={[
        "px-3 py-2 rounded-xl text-sm font-semibold",
        active ? "bg-black/5" : "hover:bg-black/5",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

// PUBLIC_INTERFACE
export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  /** Shared layout with header + tag filter sidebar. */
  const router = useRouter();
  const params = useSearchParams();
  const { isAuthed, logoutLocal } = useAuth();
  const [mobileTagsOpen, setMobileTagsOpen] = React.useState(false);

  const selectedTag = params.get("tag") || "";

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: () => api.listTags(),
    enabled: isAuthed,
  });

  function setTag(tag: string) {
    const newParams = new URLSearchParams(params.toString());
    if (tag) newParams.set("tag", tag);
    else newParams.delete("tag");
    router.push(`/notes?${newParams.toString()}`);
    setMobileTagsOpen(false);
  }

  return (
    <div className="app-shell">
      <header className="border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="nm-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/notes" className="text-lg font-extrabold tracking-tight">
              NoteMaster
            </Link>
            <span className="hidden sm:inline text-sm text-[color:var(--nm-muted)]">
              Notes • Tags • Search
            </span>
          </div>

          <nav className="flex items-center gap-1">
            <NavLink href="/notes">Notes</NavLink>
            <NavLink href="/tags">Tags</NavLink>
            {!isAuthed ? (
              <Link className="nm-btn nm-btn-primary" href="/auth/login">
                Sign in
              </Link>
            ) : (
              <button
                className="nm-btn"
                onClick={() => {
                  logoutLocal();
                  router.push("/auth/login");
                }}
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      </header>

      <div className="nm-container flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Mobile tags toggle */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              className="nm-btn"
              onClick={() => setMobileTagsOpen((v) => !v)}
              aria-expanded={mobileTagsOpen}
              aria-controls="tags-panel"
            >
              {mobileTagsOpen ? "Hide tags" : "Show tags"}
            </button>
            {selectedTag ? (
              <span className="nm-chip nm-chip-active">Tag: {selectedTag}</span>
            ) : (
              <span className="text-sm text-[color:var(--nm-muted)]">All tags</span>
            )}
          </div>

          <aside
            id="tags-panel"
            className={[
              "nm-card p-4 h-fit",
              mobileTagsOpen ? "block" : "hidden",
              "lg:block",
            ].join(" ")}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Tags</h2>
              <button className="nm-chip" onClick={() => setTag("")}>
                Clear
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className={["nm-chip", !selectedTag ? "nm-chip-active" : ""].join(" ")}
                onClick={() => setTag("")}
              >
                All
              </button>

              {tagsQuery.isLoading ? (
                <span className="text-sm text-[color:var(--nm-muted)]">Loading…</span>
              ) : tagsQuery.isError ? (
                <span className="text-sm text-[color:var(--nm-danger)]">
                  Tags unavailable (backend not ready)
                </span>
              ) : (
                tagsQuery.data?.map((t) => (
                  <button
                    key={t.name}
                    className={[
                      "nm-chip",
                      selectedTag === t.name ? "nm-chip-active" : "",
                    ].join(" ")}
                    onClick={() => setTag(t.name)}
                    title={typeof t.count === "number" ? `${t.count} notes` : undefined}
                  >
                    {t.name}
                    {typeof t.count === "number" ? (
                      <span className="text-[color:var(--nm-muted)]">({t.count})</span>
                    ) : null}
                  </button>
                ))
              )}
            </div>

            <p className="mt-4 text-xs text-[color:var(--nm-muted)]">
              Tag endpoints are wired as placeholders: <code>/tags</code>.
            </p>
          </aside>

          <main className="min-w-0">{children}</main>
        </div>
      </div>

      <footer className="border-t border-black/5 bg-white/60">
        <div className="nm-container text-xs text-[color:var(--nm-muted)] py-4">
          Configure API base URL via <code>NEXT_PUBLIC_API_BASE_URL</code>.
        </div>
      </footer>
    </div>
  );
}
