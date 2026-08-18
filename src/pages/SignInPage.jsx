import { Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import FormField, { formControlClasses } from '../components/ui/FormField'
import { siteConfig } from '../data/siteConfig'
import { getAccessToken, saveSession } from '../utils/auth'

const apiBaseUrl = (import.meta.env.VITE_DRMS_API_BASE_URL || 'https://dev-derps.gotmsolutions.com/api').replace(/\/$/, '')

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (getAccessToken()) return <Navigate to={location.state?.from || '/'} replace />

  const submit = async (event) => {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Username and password are required.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.data?.accessToken) throw new Error(result.message || 'Sign in failed. Check your credentials and try again.')
      saveSession(result.data)
      navigate(location.state?.from || '/', { replace: true })
    } catch (nextError) {
      setError(nextError.message || 'Unable to connect to the sign-in service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Seo title="Sign In" description={`Sign in to your ${siteConfig.company.shortName} account.`} />
      <section className="flex min-h-[70vh] items-center bg-slate-50 py-16">
        <div className="mx-auto w-full max-w-md px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Secure account access</p>
            <h1 className="mt-3 text-3xl font-extrabold text-navy">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Sign in with your Dolphin account to start or continue a merchant application.</p>
            {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
            <form onSubmit={submit} className="mt-7">
              <FormField id="signin-username" label="Username" required>
                <div className="relative"><UserRound className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate-400" size={18} /><input id="signin-username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} className={`${formControlClasses} pl-11`} /></div>
              </FormField>
              <div className="mt-5">
                <FormField id="signin-password" label="Password" required>
                  <div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-slate-400" size={18} /><input id="signin-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`${formControlClasses} px-11`} /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 rounded-lg p-2 text-slate-500" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                </FormField>
              </div>
              <Button type="submit" disabled={loading} className="mt-7 w-full">{loading ? <><LoaderCircle className="animate-spin" size={18} /> Signing In...</> : 'Sign In'}</Button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
