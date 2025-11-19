import { useEffect, useState } from 'react'
import Uploader from './Uploader'

export default function Composer({ open, onClose, onCreated }) {
  const [caption, setCaption] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [placeName, setPlaceName] = useState('')
  const [coords, setCoords] = useState({ lat: null, lng: null })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [open])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const payload = {
        caption,
        video_url: videoUrl,
        location_lat: coords.lat,
        location_lng: coords.lng,
        place_name: placeName || undefined,
      }
      const res = await fetch(`${baseUrl}/api/clips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to create')
      const data = await res.json()
      onCreated(data)
      onClose()
      setCaption(''); setVideoUrl(''); setPlaceName('')
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Share a clip</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm text-white/70">Video URL</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://...mp4 or use uploader below"
              required
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <div className="mt-2">
              <Uploader onUploaded={(url) => setVideoUrl(url)} />
              <p className="text-[11px] text-white/50 mt-1">Uploads are served from the backend under /uploads. Large files may take time.</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-white/70">Caption</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Say something about your clip"
              required
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-white/70">Place name (optional)</label>
            <input
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="Where are you?"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="text-xs text-white/60">
            {coords.lat && coords.lng ? (
              <span>Attaching location • {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
            ) : (
              <span>Location permission not granted — posting without coordinates</span>
            )}
          </div>
          <div className="flex items-center gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-white/80 hover:text-white">Cancel</button>
            <button disabled={loading} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10">
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
