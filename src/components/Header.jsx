import { useState } from 'react'

export default function Header({ onOpenComposer }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-slate-900/60 border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fuchsia-500 to-blue-500 shadow-lg"></div>
          <span className="text-white font-semibold text-lg tracking-tight">Incommon</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenComposer}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/10 transition"
          >
            Share a clip
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="px-2 py-1.5 rounded-lg text-white/80 hover:text-white"
            aria-label="menu"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}
