import { useEffect, useState } from 'react'
import { parseSectionTitleFontInput } from '../lib/sectionTitleFont'

const fontLoads = new Map()
const googleFontLoads = new Map()

function loadGoogleStylesheet(url) {
  let task = googleFontLoads.get(url)
  if (!task) {
    task = new Promise((resolve, reject) => {
      const link = document.createElement('link')
      const timer = setTimeout(() => {
        link.remove()
        googleFontLoads.delete(url)
        reject(new Error('Font loading timed out. Check your connection and font family name.'))
      }, 15000)
      link.rel = 'stylesheet'
      link.dataset.caseFontUrl = url
      link.href = url
      link.onload = () => { clearTimeout(timer); resolve() }
      link.onerror = () => {
        clearTimeout(timer)
        link.remove()
        googleFontLoads.delete(url)
        reject(new Error('Font could not be loaded from Google Fonts. Check the family name or your connection.'))
      }
      document.head.appendChild(link)
    })
    googleFontLoads.set(url, task)
  }
  return task
}

function regularWeightUrl(requestedUrl) {
  try {
    const url = new URL(requestedUrl)
    if (url.hostname !== 'fonts.googleapis.com') return ''
    const familyParam = url.searchParams.get('family')
    if (!familyParam) return ''
    const family = familyParam.split('&')[0].split(':')[0]
    if (!family) return ''
    url.searchParams.set('family', `${family}:wght@400`)
    url.searchParams.set('display', 'swap')
    return url.href
  } catch {
    return ''
  }
}

export function resolveTitleFont(settings = {}) {
  let source = settings.titleFontSource || 'default'
  let family = String(settings.titleFontFamily || '').trim().slice(0, 100)
  let cssFamily
  let style = {}
  let url = String(settings.titleFontUrl || '').trim()
  let googleUrl = String(settings.titleFontGoogleUrl || '').trim()
  let fileWeight = ''
  let fileStyle = ''
  style.fontWeight = settings.fontWeight
  style.fontStyle = settings.fontStyle
  if (source === 'paste') {
    const pasted = parseSectionTitleFontInput(settings.titleFontCss)
    if (pasted.error) return null
    family = pasted.family
    cssFamily = pasted.cssFamily
    style = pasted.style
    if (pasted.fileUrl) { source = 'file'; url = pasted.fileUrl; fileWeight = pasted.fileWeight; fileStyle = pasted.fileStyle }
    else if (pasted.googleUrl) { source = 'google'; googleUrl = pasted.googleUrl }
    else source = 'google'
  }
  if (source === 'default' || !family) return null
  if (source !== 'file') return { source, family, googleUrl, cssFamily: cssFamily || `${JSON.stringify(family)}, sans-serif`, style }
  // Give different hosted files separate font identities, even with the same display name.
  let hash = 0
  for (const char of `${family}:${url}`) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0
  const loadedFamily = `SectionTitle_${(hash >>> 0).toString(16)}`
  return { source, family, url, loadedFamily, cssFamily: `${loadedFamily}, sans-serif`, style: { ...style, fileWeight, fileStyle } }
}

async function loadFont(font) {
  if (font.source === 'system') return
  if (font.source === 'google') {
    let googleUrl = font.googleUrl
    if (!googleUrl) {
      googleUrl = new URL('https://fonts.googleapis.com/css2')
      const weight = Number(font.style?.fontWeight) || 400
      const axes = font.style?.fontStyle === 'italic' ? `ital,wght@1,${weight}` : `wght@${weight}`
      googleUrl.searchParams.set('family', `${font.family}:${axes}`)
      googleUrl.searchParams.set('display', 'swap')
      googleUrl = googleUrl.href
    }
    const requestedWeight = font.style?.fontWeight || '400'
    const loadAndCheck = async (url, weight) => {
      await loadGoogleStylesheet(url)
      const faces = await document.fonts.load(`${weight} 24px ${JSON.stringify(font.family)}`)
      if (!faces.length) throw new Error('Google Fonts returned no matching font face.')
    }
    try {
      await loadAndCheck(googleUrl, requestedWeight)
    } catch (error) {
      const fallbackUrl = regularWeightUrl(googleUrl)
      if (!fallbackUrl || fallbackUrl === googleUrl) {
        throw new Error('Font could not be loaded from Google Fonts. Check the family name or your connection.')
      }
      // Some Google families only provide regular or upright faces. Load that
      // face and let the browser synthesize the requested weight/style.
      try {
        await loadAndCheck(fallbackUrl, '400')
      } catch {
        throw new Error('Font could not be loaded from Google Fonts. Check the family name or your connection.')
      }
    }
    return
  }
  if (font.source === 'file') {
    const url = new URL(font.url, window.location.origin)
    if (!font.url || !['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Enter an HTTPS font URL or a path on this website.')
    }
    const face = new FontFace(font.loadedFamily, `url(${JSON.stringify(url.href)})`, {
      weight: font.style?.fileWeight || String(font.style?.fontWeight || '400'),
      style: font.style?.fileStyle || String(font.style?.fontStyle || 'normal')
    })
    await face.load()
    document.fonts.add(face)
  }
}

export default function useSectionTitleFont(settings) {
  const font = resolveTitleFont(settings)
  const key = font ? JSON.stringify(font) : ''
  const [status, setStatus] = useState({ key: '', error: '', loading: false })

  useEffect(() => {
    if (!key) return
    let cancelled = false
    setStatus({ key, error: '', loading: true })
    const timer = setTimeout(() => {
      let task = fontLoads.get(key)
      if (!task) {
        task = loadFont(JSON.parse(key))
        fontLoads.set(key, task)
        task.catch(() => fontLoads.delete(key))
      }
      task.then(() => {
        if (!cancelled) setStatus({ key, error: '', loading: false })
      }).catch(error => {
        if (!cancelled) setStatus({ key, error: error.message || 'Font could not be loaded. Check the URL and allow cross-origin font access.', loading: false })
      })
    }, 350)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [key])

  return {
    style: font ? { ...font.style, fontFamily: font.cssFamily } : undefined,
    error: status.key === key ? status.error : '',
    loading: !!key && (status.key !== key || status.loading)
  }
}
