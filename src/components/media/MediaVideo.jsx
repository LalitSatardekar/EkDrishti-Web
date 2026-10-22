import { useEffect, useState } from 'react'
import { parseVideoSource } from '../../lib/media'

export default function MediaVideo({ source, title = 'Video', autoplay = false, muted = false, loop = false, controls = true, aspectRatio = '16 / 9', poster, className = '', onLoadedMetadata }) {
  const parsed = parseVideoSource(source)
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [source])
  const ratio = String(aspectRatio || '16 / 9').replace(':', ' / ').replace('/', ' / ')
  const frameStyle = { aspectRatio: ratio, width: '100%', maxWidth: 'min(92vw, 760px)' }

  if (parsed.error) return <div className="mx-auto rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center text-xs text-amber-400" style={frameStyle}>{parsed.error}</div>
  if (failed) return <div className="mx-auto rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center text-xs text-amber-400" style={frameStyle}>Unable to embed this video. For Google Drive, set sharing to “Anyone with the link”.</div>

  if (parsed.provider === 'youtube') {
    const params = new URLSearchParams({ rel: '0', modestbranding: '1', controls: controls ? '1' : '0', autoplay: autoplay ? '1' : '0', mute: autoplay || muted ? '1' : '0', loop: loop ? '1' : '0', ...(loop ? { playlist: parsed.id } : {}) })
    return <div className={`relative mx-auto overflow-hidden rounded-xl bg-surface ${className}`} style={frameStyle}><iframe src={`${parsed.embedUrl}?${params}`} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full border-0" /></div>
  }
  if (parsed.provider === 'google-drive') return <div className={`relative mx-auto overflow-hidden rounded-xl bg-surface ${className}`} style={frameStyle}><iframe src={parsed.embedUrl} title={title} allow="autoplay; encrypted-media" allowFullScreen loading="lazy" onError={() => setFailed(true)} className="absolute inset-0 h-full w-full border-0" /></div>
  if (parsed.provider === 'direct') return <div className={`relative mx-auto overflow-hidden rounded-xl bg-surface ${className}`} style={frameStyle}><video src={parsed.source} controls={controls} autoPlay={autoplay} muted={autoplay || muted} loop={loop} poster={poster} preload="metadata" onError={() => setFailed(true)} onLoadedMetadata={onLoadedMetadata} className="h-full w-full object-contain" /></div>
  return null
}
