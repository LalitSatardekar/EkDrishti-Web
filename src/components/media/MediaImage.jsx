import { useState } from 'react'
import { mediaPosition } from '../../lib/media'

export default function MediaImage({ item, alt, fit = 'cover', position = 'center', natural = false, onDimensions, eager = false }) {
  const [failedSource, setFailedSource] = useState('')
  if (failedSource === item.src) return <div role="img" aria-label={`${alt}: image unavailable`} className="flex h-full min-h-28 w-full items-center justify-center bg-surface p-4 text-xs text-textSecondary">Image unavailable</div>
  return <img src={item.src} alt={item.alt || alt} loading={eager ? 'eager' : 'lazy'} draggable={false}
    className={`block w-full ${natural ? 'h-auto' : 'h-full'}`}
    style={{ objectFit: item.objectFit || fit, objectPosition: mediaPosition(item, position) }}
    onLoad={event => onDimensions?.(item.src, event.currentTarget.naturalWidth, event.currentTarget.naturalHeight)}
    onError={() => setFailedSource(item.src)} />
}
