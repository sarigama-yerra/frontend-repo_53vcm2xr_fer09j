import { useEffect, useRef, useState, useMemo } from 'react'

// Lightweight Map view using OpenStreetMap via an <iframe> bbox preview + manual panning controls
// This avoids adding heavy map dependencies while enabling a viewport-bounded fetch.
export default function MapView({ onClose, onSelectBounds, clips = [] }) {
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 })
  const [zoom, setZoom] = useState(12)

  // Compute lat/lng delta from zoom (rough scale). Lower zoom => larger delta
  const delta = useMemo(() => {
    const base = 0.1
    const scale = Math.pow(2, (12 - zoom))
    return { lat: base * scale, lng: base * scale }
  }, [zoom])

  const bounds = useMemo(() => {
    return {
      north: center.lat + delta.lat,
      south: center.lat - delta.lat,
      east: center.lng + delta.lng,
      west: center.lng - delta.lng,
    }
  }, [center, delta])

  useEffect(() => {
    onSelectBounds && onSelectBounds(bounds)
  }, [bounds, onSelectBounds])

  const move = (dx, dy) => {
    setCenter((c) => ({ lat: c.lat + dy * delta.lat, lng: c.lng + dx * delta.lng }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <h3 className="text-white font-semibold">Explore map</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-2 relative aspect-video bg-black">
            <iframe
              title="osm"
              className="absolute inset-0 w-full h-full"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bounds.west}%2C${bounds.south}%2C${bounds.east}%2C${bounds.north}&layer=mapnik`}
            />
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button onClick={() => move(-1, 0)} className="px-2 py-1 rounded bg-white/10 text-white border border-white/10">◀</button>
              <button onClick={() => move(1, 0)} className="px-2 py-1 rounded bg-white/10 text-white border border-white/10">▶</button>
              <button onClick={() => move(0, -1)} className="px-2 py-1 rounded bg-white/10 text-white border border-white/10">▲</button>
              <button onClick={() => move(0, 1)} className="px-2 py-1 rounded bg-white/10 text-white border border-white/10">▼</button>
              <button onClick={() => setZoom((z) => Math.min(18, z + 1))} className="px-2 py-1 rounded bg-white/10 text-white border border-white/10">＋</button>
              <button onClick={() => setZoom((z) => Math.max(2, z - 1))} className="px-2 py-1 rounded bg-white/10 text-white border border-white/10">－</button>
            </div>
          </div>
          <div className="p-3 space-y-2 overflow-auto max-h-[70vh]">
            <div className="text-white/70 text-sm">Viewport clips</div>
            {clips.length === 0 ? (
              <div className="text-white/50 text-sm">No clips in view.</div>
            ) : (
              clips.map((c) => (
                <div key={c.id} className="p-2 rounded border border-white/10 bg-white/5">
                  <div className="text-white text-sm truncate">{c.caption}</div>
                  {c.place_name && <div className="text-white/60 text-xs">{c.place_name}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
