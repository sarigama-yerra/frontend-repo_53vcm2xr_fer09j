import { useState } from 'react'

export default function Uploader({ onUploaded }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const upload = async () => {
    if (!file) return
    setLoading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${baseUrl}/api/upload`, { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      onUploaded(data.url)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-white text-sm" />
      <button onClick={upload} disabled={!file || loading} className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm">
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  )
}
