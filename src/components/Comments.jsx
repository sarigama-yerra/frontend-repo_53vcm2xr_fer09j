import { useEffect, useState } from 'react'

export default function Comments({ clipId, onClose }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(false)
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchComments = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/clips/${clipId}/comments`)
      const data = await res.json()
      setComments(data)
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchComments()
  }, [clipId])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/clips/${clipId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author: author || undefined })
      })
      if (!res.ok) throw new Error('Failed to comment')
      setText('')
      await fetchComments()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-slate-900 border border-white/10 rounded-t-xl md:rounded-xl p-4 max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold">Comments</h4>
          <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
        </div>
        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-white/60 text-sm">Be the first to comment.</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-white/60">{c.author || 'Anon'}</div>
                <div className="text-sm text-white mt-0.5">{c.text}</div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={submit} className="mt-4 space-y-2">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
          />
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a comment"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
            />
            <button disabled={loading} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm">
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
