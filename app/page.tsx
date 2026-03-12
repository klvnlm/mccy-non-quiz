import ChatQuiz from './components/ChatQuiz';

export default function Home() {
  return (
    // The outer shell is h-screen with flex col — your real site header/footer slot in here
    <div className="flex h-screen flex-col">

      {/* ── Site header ── replace with your real one */}
      <header className="shrink-0 border-b border-zinc-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-semibold tracking-tight text-zinc-900">YourBrand</span>
          <nav className="hidden gap-6 sm:flex">
            <a href="#" className="text-sm text-zinc-400 transition-colors hover:text-zinc-900">About</a>
            <a href="#" className="text-sm text-zinc-400 transition-colors hover:text-zinc-900">Contact</a>
          </nav>
        </div>
      </header>

      {/* ── Quiz — min-h-0 + flex-1 makes it fill the remaining space ── */}
      <div className="min-h-0 flex-1">
        <ChatQuiz />
      </div>

      {/* ── Site footer ── replace with your real one */}
      <footer className="shrink-0 border-t border-zinc-100 bg-white px-6 py-3">
        <p className="text-center text-xs text-zinc-400">© 2026 YourBrand. All rights reserved.</p>
      </footer>

    </div>
  );
}
