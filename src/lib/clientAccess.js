export const ACCESS_ACTIONS = ['external', 'internal', 'download', 'email', 'phone', 'whatsapp']
export const ACCESS_ICONS = ['', 'folder', 'download', 'video', 'link', 'mail', 'phone', 'whatsapp']
export const ACCESS_PRESETS = {
  solid: { background: '#F2A020', textColor: '#0B1120', borderColor: '#F2A020', borderWidth: 1, radius: 8, hoverBackground: '#D89018', hoverText: '#0B1120', hoverBorder: '#D89018' },
  outline: { background: 'transparent', textColor: '#ffffff', borderColor: '#ffffff', borderWidth: 1, radius: 8, hoverBackground: '#ffffff', hoverText: '#0B1120', hoverBorder: '#ffffff' },
  ghost: { background: 'transparent', textColor: '#ffffff', borderColor: 'transparent', borderWidth: 0, radius: 8, hoverBackground: '#ffffff18', hoverText: '#F2A020', hoverBorder: 'transparent' },
  glass: { background: '#ffffff18', textColor: '#ffffff', borderColor: '#ffffff40', borderWidth: 1, radius: 12, hoverBackground: '#ffffff30', hoverText: '#ffffff', hoverBorder: '#ffffff80' }
}
export const DEFAULT_ACCESS_LAYOUT = { mode: 'row', modeTablet: 'row', modeMobile: 'stack', align: 'center', verticalAlign: 'center', gap: 16, columnsDesktop: 3, columnsTablet: 2, columnsMobile: 1, fullWidth: false, wrap: true, paddingX: 32, paddingY: 32, canvasHeight: 360 }
export const clampAccess = (value, min, max, fallback = min) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback
export const accessElementId = id => 'access-' + id
export function accessButtons(section, project = {}) {
  const content = section?.content || {}
  const source = Array.isArray(content.buttons) ? content.buttons : (content.link ?? project.driveLinks?.allFiles) ? [{ label: content.buttonText || 'Download All Files', action: { type: 'external', value: content.link ?? project.driveLinks?.allFiles, newTab: true }, icon: 'folder', preset: 'solid' }] : []
  const seen = new Set()
  return source.filter(item => item && typeof item === 'object').map((item, index) => {
    let id = String(item.id || 'access-' + (section.id || section._id || 'legacy') + '-' + (index+1))
    while (seen.has(id)) id += '-copy'
    seen.add(id)
    return { ...item, id, label: item.label ?? 'New Button', enabled: item.enabled !== false, preset: item.preset || 'solid', icon: item.icon || '', iconPlacement: item.iconPlacement || 'left', action: { type: 'external', value: '', newTab: true, ...item.action }, appearance: { ...item.appearance }, position: { x: index % 2 * 100, y: Math.floor(index / 2) / Math.max(1, Math.ceil(source.length / 2) - 1) * 100, ...item.position } }
  })
}
export function accessAppearance(button) {
  return { paddingX: 24, paddingY: 12, minWidth: 0, maxWidth: 600, height: 0, textAlign: 'center', iconSize: 20, disabledBackground: '#374151', disabledText: '#9ca3af', disabledBorder: '#4b5563', disabledOpacity: .6, ...ACCESS_PRESETS[button.preset || 'solid'], ...button.appearance }
}
export function accessLayout(section) { return { ...DEFAULT_ACCESS_LAYOUT, ...section?.settings?.accessLayout } }
export function accessDestination(action = {}) {
  const value = String(action.value || '').trim()
  const fail = error => ({ href: '', error })
  if (!value) return fail('Enter a destination.')
  if (/[\u0000-\u0020\u007f]/.test(value)) return fail('Remove spaces or control characters from the destination.')
  if (action.type === 'internal') {
    if (!/^\/(?![\/\\])/.test(value) || value.includes('\\')) return fail('Use a local path beginning with /, such as /contact.')
    return { href: value }
  }
  if (action.type === 'email') return /^[^\s@?&#:]+@[^\s@?&#:]+\.[^\s@?&#:]+$/.test(value) ? { href: 'mailto:' + value } : fail('Enter a valid email address.')
  if (action.type === 'phone' || action.type === 'whatsapp') {
    if (!/^\+?[0-9().-]{5,25}$/.test(value)) return fail('Enter a phone number with country code.')
    const number = value.replace(/[^0-9]/g, '')
    return number.length >= 5 && number.length <= 15 ? { href: action.type === 'phone' ? 'tel:' + (value.startsWith('+') ? '+' : '') + number : 'https://wa.me/' + number } : fail('Enter 5 to 15 digits, including country code.')
  }
  if (!['external', 'download'].includes(action.type)) return fail('Choose a supported action.')
  if (action.type === 'download' && /^\/(?![\/\\])/.test(value) && !value.includes('\\')) return { href: value, download: true }
  try {
    const url = new URL(value)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || value.includes('\\')) return fail('Use a complete HTTP or HTTPS URL without embedded credentials.')
    return { href: url.href, download: action.type === 'download' }
  } catch { return fail('Enter a complete HTTP or HTTPS URL.') }
}
export function downloadSameOrigin(href, origin) {
  try { return new URL(href, origin).origin === new URL(origin).origin } catch { return false }
}
