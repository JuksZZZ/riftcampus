/**
 * Directiva-like helper: observa elementos con clase .reveal y les agrega
 * .is-visible cuando entran en viewport, para las animaciones de entrada
 * definidas en main.css. Pensado para las secciones de la Landing.
 */
export function useReveal(rootRef) {
  let observer = null

  function init() {
    const root = rootRef?.value || document
    const targets = root.querySelectorAll?.('.reveal') ?? []
    if (!targets.length) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    targets.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 70}ms`
      observer.observe(el)
    })
  }

  function destroy() {
    observer?.disconnect()
    observer = null
  }

  return { init, destroy }
}
