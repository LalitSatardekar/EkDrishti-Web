/**
 * EkDrishti Studios — Aspect Ratio Configuration & Detection Engine
 * Supported photography & cinematic ratios: 3:4, 4:3, 3:2, 2:3, 16:9, 9:16, 1:1
 */

export const SUPPORTED_RATIOS = [
  { key: '3:4', label: '3:4 Portrait', numeric: 3 / 4, type: 'portrait', badge: '3:4', css: 'aspect-[3/4]' },
  { key: '4:3', label: '4:3 Landscape', numeric: 4 / 3, type: 'landscape', badge: '4:3', css: 'aspect-[4/3]' },
  { key: '3:2', label: '3:2 Classic Photo', numeric: 3 / 2, type: 'landscape', badge: '3:2', css: 'aspect-[3/2]' },
  { key: '2:3', label: '2:3 Classic Portrait', numeric: 2 / 3, type: 'portrait', badge: '2:3', css: 'aspect-[2/3]' },
  { key: '16:9', label: '16:9 Cinematic', numeric: 16 / 9, type: 'landscape', badge: '16:9', css: 'aspect-[16/9]' },
  { key: '9:16', label: '9:16 Story / Reel', numeric: 9 / 16, type: 'portrait', badge: '9:16', css: 'aspect-[9/16]' },
  { key: '1:1', label: '1:1 Square', numeric: 1 / 1, type: 'square', badge: '1:1', css: 'aspect-square' },
  { key: 'auto', label: 'Auto (Original)', numeric: null, type: 'auto', badge: 'Auto', css: '' }
]

/**
 * Accurately detects the closest supported aspect ratio from natural image dimensions
 * @param {number} width - Natural width of image
 * @param {number} height - Natural height of image
 * @returns {Object} { key, label, numeric, badge, type }
 */
export const detectClosestRatio = (width, height) => {
  if (!width || !height || width <= 0 || height <= 0) {
    return SUPPORTED_RATIOS.find((r) => r.key === 'auto')
  }

  const imageRatio = width / height

  // Find ratio with minimum absolute distance
  let closest = SUPPORTED_RATIOS[0]
  let minDiff = Infinity

  for (const item of SUPPORTED_RATIOS) {
    if (item.numeric === null) continue
    const diff = Math.abs(imageRatio - item.numeric)
    if (diff < minDiff) {
      minDiff = diff
      closest = item
    }
  }

  return closest
}

/**
 * Returns Tailwind aspect class for a ratio key
 */
export const getAspectRatioClass = (key) => {
  const match = SUPPORTED_RATIOS.find((r) => r.key === key)
  return match ? match.css : ''
}
