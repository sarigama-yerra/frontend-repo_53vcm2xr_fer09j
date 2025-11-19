export default function ClipCard({ clip, onLike }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-800/40 backdrop-blur">
      <div className="aspect-[9/16] bg-black">
        {/* For demo: show a video if it's a valid URL; otherwise placeholder */}
        <video
          src={clip.video_url}
          className="w-full h-full object-cover"
          controls
          playsInline
        />
      </div>
      <div className="p-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-white text-sm">{clip.caption}</p>
          {clip.place_name && (
            <p className="text-xs text-white/60 mt-1">{clip.place_name}</p>
          )}
        </div>
        <button
          onClick={() => onLike(clip.id)}
          className="text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/10"
        >
          ❤ {clip.like_count}
        </button>
      </div>
    </div>
  )
}
