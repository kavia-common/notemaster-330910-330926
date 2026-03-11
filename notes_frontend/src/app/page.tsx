import Link from "next/link";

export default function Home() {
  return (
    <main className="nm-container">
      <section className="nm-card p-8 mt-10 bg-gradient-to-b from-[rgba(59,130,246,0.10)] to-white">
        <h1 className="text-3xl font-extrabold tracking-tight">NoteMaster</h1>
        <p className="mt-2 text-[color:var(--nm-muted)]">
          A clean notes app with tags, search, and fast editing.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Link className="nm-btn nm-btn-primary" href="/auth/login">
            Sign in
          </Link>
          <Link className="nm-btn" href="/notes">
            Go to notes
          </Link>
        </div>

        <p className="mt-6 text-xs text-[color:var(--nm-muted)]">
          Backend REST wiring is in place with placeholder endpoints. Set{" "}
          <code>NEXT_PUBLIC_API_BASE_URL</code> to enable API calls.
        </p>
      </section>
    </main>
  );
}
