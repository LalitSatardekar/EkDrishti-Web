import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * AnimatedCounter — counts from 0 to `target` when scrolled into view.
 * Props:
 *  target   – numeric end value (number)
 *  suffix   – string appended after number (e.g. '+', 'M+', '%', 'x')
 *  prefix   – string prepended before number (e.g. '$')
 *  decimals – decimal places (default 0)
 *  duration – animation duration in seconds (default 2)
 *  className – extra tailwind classes
 */
const AnimatedCounter = ({
  target,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 2,
  className = '',
}) => {
  const elRef = useRef(null)
  const objRef = useRef({ val: 0 })

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    const tween = gsap.to(objRef.current, {
      val: target,
      duration,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      onUpdate: () => {
        el.textContent =
          prefix +
          objRef.current.val.toFixed(decimals) +
          suffix
      },
    })

    return () => {
      tween.kill()
    }
  }, [target, suffix, prefix, decimals, duration])

  return (
    <span ref={elRef} className={className}>
      {prefix}0{suffix}
    </span>
  )
}

export default AnimatedCounter
