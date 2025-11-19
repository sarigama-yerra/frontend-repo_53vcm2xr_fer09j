import { useEffect, useState } from 'react'
import Header from './components/Header'
import ClipCard from './components/ClipCard'
import Composer from './components/Composer'

function App() {
  const [clips, setClips] = useState([])
  const [composerOpen, setComposerOpen] = useState(false)
  const [coords, setCoords] = useState({ lat: null, lng: null })

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
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
    const params = new URLSearchParams()
    if (lat && lng) {
      params.set('lat', lat)
      params.set('lng', lng)
      params.set('radiusKm', '25')
    }
    const res = await fetch(`${baseUrl}/api/clips?${params.toString()}`)
    const data = await res.json()
    setClips(data)
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
        {clips.length === 0 ? (
          <div className="col-span-full text-center text-white/70 py-20">
            No clips yet. Be the first to share something around you!
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
