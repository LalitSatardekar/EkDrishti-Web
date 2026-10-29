import marketingImage from '../../assets/work/category2.png'
import productionImage from '../../assets/work/category3.png'
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { mindMapConfigs } from './mindMapConfig'

const SERVICE_NAMES = Object.fromEntries(
  Object.entries(mindMapConfigs).map(([type, config]) => [type, config.services.map(({ label }) => label)])
)

const EventsTypingHero = ({ serviceType = 'events' }) => {
  const services = SERVICE_NAMES[serviceType] || SERVICE_NAMES.events
  const longestService = services.reduce((longest, name) => name.length > longest.length ? name : longest, '')
  const reducedMotion = useReducedMotion()
  const [typing, setTyping] = useState({ index: 0, length: 0, deleting: false })
  const currentService = services[typing.index]

  useEffect(() => {
    if (reducedMotion) return

    const isComplete = typing.length === currentService.length
    const delay = typing.deleting ? 80 : isComplete ? 2400 : 160
    const timeout = window.setTimeout(() => {
      setTyping((previous) => {
        if (previous.deleting && previous.length === 0) {
          return { index: (previous.index + 1) % services.length, length: 0, deleting: false }
        }
        if (!previous.deleting && isComplete) {
          return { ...previous, deleting: true }
        }
        return { ...previous, length: previous.length + (previous.deleting ? -1 : 1) }
      })
    }, typing.deleting && typing.length === 0 ? 500 : delay)

    return () => window.clearTimeout(timeout)
  }, [typing, currentService, reducedMotion, services])

  return (
    <section className="relative isolate flex min-h-[70svh] items-center overflow-hidden bg-primary py-24 md:min-h-[80svh] md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={serviceType === 'digitalMarketing' ? marketingImage : serviceType === 'production' ? productionImage : '/assets/family-events-hero.jpg'}
          alt=""
          fetchpriority="high"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/20" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      </div>
      <div className="section-container w-full text-center">
        <h1 className="font-heading font-bold tracking-tight">
          <span className="sr-only">We Manage: {services.join(', ')}.</span>
          <span aria-hidden="true" className="flex flex-col items-center justify-center gap-[0.35em] whitespace-normal text-[clamp(2rem,8vw,3.5rem)] leading-[1.2] md:flex-row md:items-baseline md:whitespace-nowrap md:text-[clamp(0.75rem,3.2vw,3.5rem)]">
            <span className="shrink-0 text-textPrimary [text-shadow:0_0_18px_rgba(255,255,255,0.22)]">We Manage</span>
            <span className="grid w-full min-w-0 text-center md:w-auto md:text-left">
              <span className="invisible col-start-1 row-start-1" aria-hidden="true">{longestService}<span className="ml-1 inline-block w-[3px]" /></span>
              <span className="col-start-1 row-start-1 text-amber-400 [text-shadow:0_0_18px_rgba(251,191,36,0.35),0_0_36px_rgba(251,191,36,0.15)]">
                {reducedMotion ? services[0] : currentService.slice(0, typing.length)}
                <span className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] bg-amber-400 motion-safe:animate-pulse" />
              </span>
            </span>
          </span>
        </h1>
      </div>
    </section>
  )
}

export default EventsTypingHero

