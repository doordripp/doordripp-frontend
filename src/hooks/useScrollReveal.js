import { useEffect, useRef } from 'react'

/**
 * useScrollReveal — Lightweight IntersectionObserver hook
 *
 * Adds the `.revealed` class to observed elements when they enter the viewport.
 * Works with the `.reveal` / `.reveal-fade` CSS classes defined in index.css.
 *
 * @param {Object} options
 * @param {number}  options.threshold  - Intersection ratio to trigger (0–1). Default: 0.12
 * @param {number}  options.rootMargin - Root margin string. Default: '0px'
 * @param {boolean} options.once       - Only trigger once. Default: true
 * @param {number}  options.stagger    - Delay (ms) added per sibling child. Default: 0
 *
 * @returns {React.RefObject} ref — attach to the container element
 *
 * Usage:
 *   const ref = useScrollReveal()
 *   <section ref={ref}>
 *     <div className="reveal">...</div>
 *     <div className="reveal">...</div>
 *   </section>
 *
 *   Or observe the element itself:
 *   const ref = useScrollReveal({ self: true })
 *   <div ref={ref} className="reveal">...</div>
 */
export default function useScrollReveal({
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  once = true,
  stagger = 0,
  self = false,
} = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    // Determine which elements to observe
    const targets = self
      ? [container]
      : Array.from(container.querySelectorAll('.reveal, .reveal-fade'))

    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target
            const delay = stagger > 0
              ? (targets.indexOf(el) * stagger)
              : 0

            setTimeout(() => {
              el.classList.add('revealed')
            }, delay)

            if (once) observer.unobserve(el)
          } else if (!once) {
            entry.target.classList.remove('revealed')
          }
        })
      },
      { threshold, rootMargin }
    )

    targets.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [threshold, rootMargin, once, stagger, self])

  return ref
}
