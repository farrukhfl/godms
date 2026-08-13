import { useEffect, useRef, useState } from 'react'

export default function Reveal({ children, className = '', delay = 0, direction = 'up', as: Component = 'div', disabled = false }) {
  const elementRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element || disabled) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setIsVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.unobserve(entry.target)
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [disabled])

  if (disabled) return <Component className={className}>{children}</Component>

  return (
    <Component
      ref={elementRef}
      style={{ '--reveal-delay': `${delay}ms` }}
      className={`reveal reveal-${direction} ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </Component>
  )
}
