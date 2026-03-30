import { useEffect, useState } from 'react'

const CACHE_NAME = 'image-cache-v1'

// Cache images in the browser Cache Storage and return an object URL for display
export const useCachedImage = (src) => {
	const [cachedSrc, setCachedSrc] = useState(src || '')
	const [loading, setLoading] = useState(Boolean(src))
	const [error, setError] = useState(null)

	useEffect(() => {
		let active = true
		let objectUrl

		if (!src) {
			setCachedSrc('')
			setLoading(false)
			return () => {}
		}

		// Skip Cache API for cross-origin images to avoid CORS preflight failures
		const url = (() => {
			try {
				return new URL(src, window.location.href)
			} catch (_) {
				return null
			}
		})()
		const isCrossOrigin = url && url.origin !== window.location.origin

		const load = async () => {
			// Fall back to direct src if Cache API is unavailable or cross-origin
			if (typeof caches === 'undefined' || isCrossOrigin) {
				setCachedSrc(src)
				setLoading(false)
				return
			}

			try {
				const cache = await caches.open(CACHE_NAME)
				const cachedResponse = await cache.match(src)

				if (cachedResponse) {
					const blob = await cachedResponse.blob()
					objectUrl = URL.createObjectURL(blob)
					if (active) {
						setCachedSrc(objectUrl)
						setLoading(false)
					}
					return
				}

				const response = await fetch(src, { mode: 'cors' })
				if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`)

				await cache.put(src, response.clone())
				const blob = await response.blob()
				objectUrl = URL.createObjectURL(blob)
				if (active) {
					setCachedSrc(objectUrl)
					setLoading(false)
				}
			} catch (err) {
				if (active) {
					setCachedSrc(src)
					setError(err)
					setLoading(false)
				}
			}
		}

		load()

		return () => {
			active = false
			if (objectUrl) URL.revokeObjectURL(objectUrl)
		}
	}, [src])

	return { cachedSrc, loading, error }
}
