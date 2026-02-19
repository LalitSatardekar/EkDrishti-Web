/**
 * PackageCard — pure UI, no animation logic.
 * All animation is driven externally by CinematicStackedCarousel via GSAP.
 *
 * Props:
 *  item       – { id, title, subtitle, description, icon, image, features[] }
 *  isActive   – boolean, used for conditional ring / text highlights
 */
import React from 'react'

export default function PackageCard({ item = {}, isActive = false }) {
  const { title, subtitle, description, icon, image, features = [], price, period, badge } = item

  return (
    <article
      className={`
        glass-card w-full rounded-2xl overflow-hidden
        border transition-colors duration-300
        ${isActive ? 'border-amber-500/40 shadow-[0_0_48px_rgba(245,158,11,0.22)]' : 'border-borderSubtle hover:border-amber-500/20 hover:shadow-[0_0_24px_rgba(245,158,11,0.10)]'}
      `}
    >
      {/* Top image / icon block */}
      {image ? (
        <div className="relative w-full h-44 overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/80" />
        </div>
      ) : (
        <div className="relative flex items-center justify-center h-32 bg-gradient-to-b from-accent/10 to-transparent">
          {badge && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-full tracking-wide">
              {badge}
            </span>
          )}
          {icon && (
            <span data-stagger className="text-5xl select-none" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-7 space-y-4">
        {/* Heading + price row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 data-stagger className="font-heading font-bold text-2xl text-textPrimary leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p data-stagger className="mt-1 text-sm font-medium text-accentLight tracking-wide">
                {subtitle}
              </p>
            )}
          </div>
          {price && (
            <div data-stagger className="text-right shrink-0">
              <span className="font-heading font-bold text-2xl text-textPrimary">{price}</span>
              {period && <span className="text-xs text-textSecondary ml-0.5">{period}</span>}
            </div>
          )}
        </div>

        {/* Description */}
        {description && (
          <p
            data-stagger
            className="text-textSecondary text-sm leading-relaxed"
          >
            {description}
          </p>
        )}

        {/* Features list */}
        {features.length > 0 && (
          <ul className="space-y-2 pt-1">
            {features.map((feat, i) => (
              <li
                key={i}
                data-stagger
                className="flex items-center gap-2 text-sm text-textSecondary"
              >
                {/* accent check icon */}
                <svg
                  className="shrink-0 w-4 h-4 text-accent"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {feat}
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <div data-stagger className="pt-2">
          <button className="btn-primary w-full text-center text-sm">
            Learn More
          </button>
        </div>
      </div>
    </article>
  )
}
