/**
 * SectionTitle — reusable section heading with optional badge, subtitle, and accent gradient span.
 * Props:
 *  badge      – small pill text above the heading
 *  title      – main heading (string or array; last word gets accent gradient if accentLast=true)
 *  accentSpan – the word/phrase that gets gradient treatment (renders after title)
 *  subtitle   – subtext paragraph
 *  align      – 'center' | 'left'  (default: 'center')
 */
const SectionTitle = ({
  badge,
  title,
  accentSpan,
  subtitle,
  align = 'center',
}) => {
  const alignClass = align === 'left' ? 'text-left' : 'text-center mx-auto'

  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      {badge && (
        <span className="inline-block px-4 py-1.5 mb-5 text-xs font-semibold tracking-widest uppercase rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
          {badge}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl font-heading font-bold text-textPrimary leading-tight">
        {title}
        {accentSpan && (
          <>
            {' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accentLight to-amber-400">
              {accentSpan}
            </span>
          </>
        )}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg text-textSecondary max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionTitle
