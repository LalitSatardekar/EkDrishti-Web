const env = import.meta.env

export const API_BASE_URL = env.VITE_API_URL || 'http://localhost:5000/api'

export const IS_PRODUCTION = env.PROD
export const IS_DEVELOPMENT = env.DEV

const trimTrailingSlash = (value = '') => value.replace(/\/$/, '')

// Try to infer original-base from the provided WebP base when not set explicitly
const resolveOriginalBase = () => {
	if (env.VITE_ASSET_ORIGINAL_BASE_URL) return env.VITE_ASSET_ORIGINAL_BASE_URL
	const webpBase = env.VITE_ASSET_WEBP_BASE_URL
	if (webpBase && /\/webp\/?$/i.test(webpBase)) return webpBase.replace(/\/webp\/?$/i, '/original')
	return '/assets/original'
}

export const ASSET_ORIGINAL_BASE_URL = trimTrailingSlash(resolveOriginalBase())
export const ASSET_WEBP_BASE_URL = trimTrailingSlash(env.VITE_ASSET_WEBP_BASE_URL || '/assets/webp')
export const ASSET_DEFAULT_VARIANT = env.VITE_ASSET_DEFAULT_VARIANT || 'webp'
