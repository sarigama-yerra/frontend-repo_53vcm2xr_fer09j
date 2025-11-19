import { useEffect, useState } from 'react'
import Header from './components/Header'
import ClipCard from './components/ClipCard'
import Composer from './components/Composer'

function App() {
  const [clips, setClips] = useState([])
  const [composerOpen, setComposerOpen] = useState(false)
  const [coords, setCoords] = useState({ lat: null, lng: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
          fetchClips(pos.coords.latitude, pos.coords.longitude)
        },
        () => fetchClips(),
        { enableHighAccuracy: true, timeout: 8000 }
      )
    } else {
      fetchClips()
    }
  }, [])

  const fetchClips = async (lat, lng) => {
    try {
      setLoading(true)
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const params = new URLSearchParams()
      if (lat && lng) {
        params.set('lat', lat)
        params.set('lng', lng)
        params.set('radiusKm', '25')
      }
      const res = await fetch(`${baseUrl}/api/clips?${params.toString()}`)
      const data = await res.json()

      // If location-filtered query returned nothing, fall back to global recent clips
      if (Array.isArray(data) && data.length === 0 && lat && lng) {
        const res2 = await fetch(`${baseUrl}/api/clips?limit=50`)
        const data2 = await res2.json()
        setClips(data2)
      } else {
        setClips(data)
      }
    } catch (e) {
      // simple noop; could add toast
      setClips([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreated = (clip) => {
    setClips((prev) => [clip, ...prev])
  }

  const handleLike = async (id) => {
    try {
      const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
      const res = await fetch(`${baseUrl}/api/clips/${id}/like`, { method: 'POST' })
      if (!res.ok) return
      const updated = await res.json()
      setClips((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header onOpenComposer={() => setComposerOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-white/70 py-20">Loading clips…</div>
        ) : clips.length === 0 ? (
          <div className="col-span-full text-center text-white/70 py-20">
            No clips yet nearby. Be the first to share something around you!
            <div className="mt-4">
              <button
                onClick={() => fetchClips()}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10"
              >
                Explore everyone’s clips
              </button>
            </div>
          </div>
        ) : (
          clips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} onLike={handleLike} />
          ))
        )}
      </main>

      <Composer open={composerOpen} onClose={() => setComposerOpen(false)} onCreated={handleCreated} />
    </div>
  )
}

export default App
