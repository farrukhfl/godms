import { useEffect, useRef } from 'react'

// Official Google reCAPTCHA v2 site key (default test key works on localhost / testing)
const DEFAULT_RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'

export default function GoogleRecaptcha({ onVerify, onExpire, error }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY || DEFAULT_RECAPTCHA_SITE_KEY

  useEffect(() => {
    let isMounted = true

    const tryRender = () => {
      if (!isMounted || !containerRef.current) return

      if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
        if (containerRef.current.innerHTML === '') {
          try {
            const id = window.grecaptcha.render(containerRef.current, {
              sitekey: siteKey,
              callback: (token) => {
                if (onVerify) onVerify(token)
              },
              'expired-callback': () => {
                if (onExpire) onExpire()
              },
              'error-callback': () => {
                if (onExpire) onExpire()
              },
            })
            widgetIdRef.current = id
            setIsRendered(true)
          } catch {
            // Already rendered or widget mounted
          }
        }
      }
    }

    if (window.grecaptcha && window.grecaptcha.render) {
      tryRender()
    } else {
      window.onRecaptchaLoadedCallback = () => {
        tryRender()
      }

      if (!document.getElementById('google-recaptcha-v2-script')) {
        const script = document.createElement('script')
        script.id = 'google-recaptcha-v2-script'
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoadedCallback&render=explicit'
        script.async = true
        script.defer = true
        document.body.appendChild(script)
      }
    }

    return () => {
      isMounted = false
    }
  }, [siteKey, onVerify, onExpire])

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-navy">
        Security Verification
      </p>
      <div className="overflow-x-auto">
        <div ref={containerRef} className="min-h-[78px]" />
      </div>
      {error && (
        <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>
      )}
    </div>
  )
}
