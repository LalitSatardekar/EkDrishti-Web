const allowedProperties = {
  'font-family': 'fontFamily',
  'font-weight': 'fontWeight',
  'font-style': 'fontStyle',
  'font-size': 'fontSize',
  'line-height': 'lineHeight',
  'letter-spacing': 'letterSpacing',
  'word-spacing': 'wordSpacing',
  'text-transform': 'textTransform',
  'text-align': 'textAlign',
  'text-decoration': 'textDecoration',
  'font-variant': 'fontVariant',
  'font-stretch': 'fontStretch'
}

function declarations(css) {
  const result = {}
  const parts = [...css.matchAll(/\{([^{}]*)\}/g)].map(match => match[1])
  const bodies = parts.length ? parts : [css]
  for (const body of bodies) {
    const entries = body.match(/(?:^|;)\s*([\w-]+)\s*:\s*([^;{}]+)/g) || []
    for (const entry of entries) {
      const split = entry.match(/^\s*([\w-]+)\s*:\s*([^;{}]+)/)
      if (split) result[split[1].toLowerCase()] = split[2].trim()
    }
  }
  return { values: result }
}

function safeCssValue(value) {
  return value && value.length < 160 && !/[{}<>`]/.test(value) && !/url\s*\(|expression\s*\(|javascript\s*:/i.test(value)
}

function googleUrlFrom(text) {
  const direct = text.match(/https?:\/\/fonts\.googleapis\.com\/css2?\?[^\s"'<>)]*/i)?.[0]
    || text.match(/https?:\\\/\\\/fonts\.googleapis\.com\\\/css2?\\\?[^\s"'<>)]*/i)?.[0]?.replaceAll('\\/', '/')
  if (!direct) return ''
  try {
    const url = new URL(direct.replaceAll('&amp;', '&'))
    if (url.hostname !== 'fonts.googleapis.com' || !/^\/css2?$/.test(url.pathname) || !url.searchParams.has('family')) return ''
    return url.href
  } catch { return '' }
}

function customFace(text) {
  const match = text.match(/@font-face\s*\{([^{}]*)\}/i)
  if (!match) return null
  const values = declarations(match[1]).values
  const family = values['font-family']?.replace(/^(['"])(.*)\1$/, '$2').trim()
  const url = match[1].match(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/i)?.[2]
  if (!family || !url) return null
  return { family, url, weight: values['font-weight'], style: values['font-style'] }
}

export function parseSectionTitleFontInput(input) {
  const text = String(input || '').trim().slice(0, 12000)
  if (!text) return { error: 'Paste a Google Fonts link, font-family declaration, or CSS font style.' }

  const googleUrl = googleUrlFrom(text)
  const face = customFace(text)
  const parsed = declarations(text).values
  const declaredFamily = parsed['font-family']?.trim()
  const firstFamily = declaredFamily?.split(',')[0]?.trim().replace(/^(['"])(.*)\1$/, '$2')
  let family = face?.family || firstFamily
  if (!family && googleUrl) {
    try { family = new URL(googleUrl).searchParams.get('family')?.split('&')[0].replace(/:[^:]*$/, '').replaceAll('+', ' ') }
    catch { /* report the useful input error below */ }
  }
  if (!family) return { error: 'Could not find a font family. Paste CSS with font-family, a Google Fonts link, or an @font-face rule.' }

  const style = {}
  for (const [property, styleProperty] of Object.entries(allowedProperties)) {
    const value = parsed[property]
    if (value && safeCssValue(value)) style[styleProperty] = value
  }
  if (face?.weight && safeCssValue(face.weight)) style.fontWeight = face.weight
  if (face?.style && safeCssValue(face.style)) style.fontStyle = face.style

  return {
    family: family.slice(0, 100),
    cssFamily: (declaredFamily || JSON.stringify(family)).slice(0, 160),
    googleUrl,
    fileUrl: face?.url || '',
    fileWeight: face?.weight || '',
    fileStyle: face?.style || '',
    style,
    error: ''
  }
}
