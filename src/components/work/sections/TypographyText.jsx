import { useEffect, useId } from 'react'
import useSectionTitleFont from '../../../hooks/useSectionTitleFont'
import { resolveCaseTypography } from '../../../lib/caseTypography'

function useTypographyStyle(project, section, role, elementId) {
  const styleDefinition = resolveCaseTypography(project, section, role, elementId)
  const fontSource = styleDefinition.fontSource || (styleDefinition.fontFamily ? 'google' : 'default')
  const hookSettings = {
    titleFontSource: styleDefinition.pastedCss ? 'paste' : fontSource === 'custom' ? 'file' : fontSource,
    titleFontFamily: styleDefinition.fontFamily,
    titleFontUrl: styleDefinition.fontUrl,
    titleFontGoogleUrl: styleDefinition.googleUrl,
    titleFontCss: styleDefinition.pastedCss,
    fontWeight: styleDefinition.fontWeight,
    fontStyle: styleDefinition.fontStyle
  }
  const font = useSectionTitleFont(hookSettings)
  const style = { ...styleDefinition }
  delete style.fontFamily
  delete style.fontSource
  delete style.fontUrl
  delete style.googleUrl
  delete style.pastedCss

  return { ...font.style, ...style }
}

export default function TypographyText({ role, project, section, elementId, as: Tag = 'span', children, style, ...props }) {
  const resolved = resolveCaseTypography(project, section, role, elementId)
  const typographyStyle = useTypographyStyle(project, section, role, elementId)
  const instanceId = useId().replace(/[^a-z0-9_-]/gi, '')
  const responsive = ['Desktop', 'Tablet', 'Mobile'].some(device => resolved[`fontSize${device}`])
  const responsiveClass = `type-${instanceId}`
  useEffect(() => {
    if (!responsive) return
    const safeSize = value => {
      const text = String(value || '').trim()
      return /^(\d+(\.\d+)?(px|rem|em|vw|vh|%)?)$/.test(text) ? (/^\d+(\.\d+)?$/.test(text) ? `${text}px` : text) : ''
    }
    const mobile = safeSize(resolved.fontSizeMobile)
    const tablet = safeSize(resolved.fontSizeTablet)
    const desktop = safeSize(resolved.fontSizeDesktop)
    const rules = [
      mobile && `@media(max-width:767px){.${responsiveClass}{font-size:${mobile}!important}}`,
      tablet && `@media(min-width:768px) and (max-width:1023px){.${responsiveClass}{font-size:${tablet}!important}}`,
      desktop && `@media(min-width:1024px){.${responsiveClass}{font-size:${desktop}!important}}`
    ].filter(Boolean).join('\n')
    if (!rules) return
    const node = document.createElement('style')
    node.dataset.typographyRole = responsiveClass
    node.textContent = rules
    document.head.appendChild(node)
    return () => node.remove()
  }, [responsive, responsiveClass, resolved.fontSizeDesktop, resolved.fontSizeTablet, resolved.fontSizeMobile])

  const renderedTypography = { ...(typographyStyle || {}) }
  delete renderedTypography.fontSizeDesktop
  delete renderedTypography.fontSizeTablet
  delete renderedTypography.fontSizeMobile
  const { fontSize, ...renderedStyle } = renderedTypography
  const { fontSizeDesktop, fontSizeTablet, fontSizeMobile } = resolved
  const desktopSize = fontSizeDesktop || fontSize
  const dimension = value => /^\d+(\.\d+)?$/.test(String(value)) ? `${value}px` : value
  for (const property of ['marginTop', 'marginBottom', 'letterSpacing', 'WebkitTextStrokeWidth']) if (renderedStyle[property] !== undefined) renderedStyle[property] = dimension(renderedStyle[property])
  return <Tag {...props} className={`${props.className || ''}${responsive ? ` ${responsiveClass}` : ''}`.trim()}
    style={{ overflowWrap: 'anywhere', ...renderedStyle, ...(desktopSize ? { fontSize: dimension(desktopSize) } : {}), ...style }}>{children}</Tag>
}
