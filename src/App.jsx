import { useEffect, useState, useCallback } from 'react'
import Header from './components/Header'
import ClipCard from './components/ClipCard'
import Composer from './components/Composer'

function App() {
  const [clips, setClips] = useState([])
  const [composerOpen, setComposerOpen] = useState(false)
  const [coords, setCoords] = useState({ lat: null, lng: null })
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('nearby') // 'nearby' | 'worldwide'

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const fetchClips = useCallback(async (opts = {}) => {
    const { lat, lng, forceWorldwide = false } = opts
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (!forceWorldwide && mode === 'nearby' && lat && lng) {
        params.set('lat', lat)
        params.set('lng', lng)
        params.set('radiusKm', '25')
      } else {
        params.set('limit', '50')
      }
      const res = await fetch(`${baseUrl}/api/clips?${params.toString()}`)
      const data = await res.json()

      // If we tried nearby and got nothing, fall back to worldwide automatically
      if (
        Array.isArray(data) && data.length === 0 && mode === 'nearby' && lat && lng && !forceWorldwide
      ) {
        const res2 = await fetch(`${baseUrl}/api/clips?limit=50`)
        const data2 = await res2.json()
        setClips(data2)
      } else {
        setClips(data)
      }
    } catch (e) {
      setClips([])
    } finally {
      setLoading(false)
    }
  }, [mode, baseUrl])

  // On mount: get geolocation for nearby if available
  useEffect(() => {
    if (mode === 'nearby') {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords
            setCoords({ lat: latitude, lng: longitude })
            fetchClips({ lat: latitude, lng: longitude })
          },
          () => fetchClips({ forceWorldwide: true }),
          { enableHighAccuracy: true, timeout: 8000 }
        )
      } else {
        fetchClips({ forceWorldwide: true })
      }
    } else {
      // worldwide
      fetchClips({ forceWorldwide: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const handleCreated = (clip) => {
    setClips((prev) => [clip, ...prev])
  }

  const handleLike = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/api/clips/${id}/like`, { method: 'POST' })
      if (!res.ok) return
      const updated = await res.json()
      setClips((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header onOpenComposer={() => setComposerOpen(true)} mode={mode} onChangeMode={setMode} />

      <main className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-white/70 py-20">Loading clips…</div>
        ) : clips.length === 0 ? (
          <div className="col-span-full text-center text-white/70 py-20">
            {mode === 'nearby' ? (
              <>
                No clips yet nearby. Be the first to share something around you!
                <div className="mt-4">
                  <button
                    onClick={() => fetchClips({ forceWorldwide: true })}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  >
                    Explore everyone’s clips
                  </button>
                </div>
              </>
            ) : (
              'No clips yet. Be the first to share something!'
            )}
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
