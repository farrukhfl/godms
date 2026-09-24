import { useState } from 'react'
import { LockKeyhole, RefreshCw, TriangleAlert } from 'lucide-react'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import { clearPassword, getPassword, setPassword } from '../features/insights/api'
import useInsights from '../features/insights/useInsights'
import {
  BarList,
  CRITICAL,
  DataTable,
  EmptyState,
  Panel,
  SERIES_1,
  SERIES_2,
  SectionHeading,
  Skeleton,
  StatTile,
  StepFunnel,
  TrendChart,
} from '../features/insights/charts'

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
]

const number = (value) => Number(value || 0).toLocaleString('en-US')
const rate = (part, whole) => (Number(whole) > 0 ? `${Math.round((Number(part) / Number(whole)) * 100)}%` : '—')

/** Each panel reports its own failure, so one bad query cannot blank the page. */
function PanelState({ query, children, skeleton = 4 }) {
  if (query.loading) return <Skeleton rows={skeleton} />
  if (query.error) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
        <TriangleAlert className="mt-0.5 shrink-0" size={16} />
        <span>{query.error}</span>
      </div>
    )
  }
  return children
}

function SignIn({ onUnlock }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!value.trim()) return
    setChecking(true)
    setError('')
    setPassword(value.trim())

    try {
      const response = await fetch('/api/insights-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': value.trim() },
        body: JSON.stringify({ query: 'overview', days: 7 }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        clearPassword()
        setError(data.error || 'Could not sign in.')
        return
      }
      onUnlock()
    } catch {
      clearPassword()
      setError('Could not reach the analytics endpoint.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mist text-primary">
          <LockKeyhole size={22} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-navy">Site insights</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Read-only traffic and application analytics. This dashboard cannot view or change customer records.
        </p>

        <form onSubmit={submit} className="mt-6">
          <label htmlFor="insights-password" className="text-sm font-bold text-slate-700">Dashboard password</label>
          <input
            id="insights-password"
            type="password"
            autoComplete="current-password"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {error ? <p className="mt-3 text-sm font-semibold text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={checking} className="mt-5 w-full justify-center">
            {checking ? 'Checking…' : 'View dashboard'}
          </Button>
        </form>
      </div>
    </div>
  )
}

function Dashboard({ onLock }) {
  const [days, setDays] = useState(30)

  const overview = useInsights('overview', days)
  const trend = useInsights('daily_trend', days)
  const funnel = useInsights('application_funnel', days)
  const dropoff = useInsights('application_dropoff', days)
  const errorsByStep = useInsights('application_errors', days)
  const leads = useInsights('abandoned_leads', days)
  const forms = useInsights('form_performance', days)
  const formFields = useInsights('form_dropoff_fields', days)
  const pages = useInsights('top_pages', days)
  const sources = useInsights('traffic_sources', days)
  const campaigns = useInsights('campaigns', days)
  const devices = useInsights('devices', days)
  const countries = useInsights('countries', days)

  const all = [overview, trend, funnel, dropoff, errorsByStep, leads, forms, formFields, pages, sources, campaigns, devices, countries]
  const refreshAll = () => all.forEach((query) => query.refresh())

  const totals = overview.rows[0] || {}
  const spark = (key) => trend.rows.map((row) => row[key])

  return (
    <div className="pb-16">
      <header className="border-b border-navy/10 bg-navy">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-5 px-4 py-7 sm:px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">Dolphin Merchant Services</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Site insights</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              Traffic, form completion and merchant application drop-off. Read-only — this dashboard cannot change a
              customer record.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-white/10 p-1 ring-1 ring-white/15">
              {RANGES.map((range) => (
                <button
                  key={range.days}
                  type="button"
                  onClick={() => setDays(range.days)}
                  className={`rounded-lg px-3 py-1.5 text-[13px] font-bold transition ${
                    days === range.days ? 'bg-white text-navy shadow-sm' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={refreshAll}
              className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-[13px] font-bold text-white/80 ring-1 ring-white/15 transition hover:bg-white/15 hover:text-white"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              type="button"
              onClick={onLock}
              className="rounded-xl px-3 py-2 text-[13px] font-bold text-white/60 transition hover:text-white"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {overview.error ? (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            <TriangleAlert className="mt-0.5 shrink-0" size={16} />
            <span>{overview.error}</span>
          </div>
        ) : null}

        <div className="pt-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Page views"
              value={number(totals.pageviews)}
              hint={`${number(totals.visitors)} visitors · ${number(totals.sessions)} sessions`}
              loading={overview.loading}
              spark={spark('pageviews')}
            />
            <StatTile
              label="Applications started"
              value={number(totals.app_starts)}
              hint={`${number(totals.app_submits)} submitted`}
              loading={overview.loading}
              spark={spark('app_starts')}
              sparkColor={SERIES_2}
            />
            <StatTile
              label="Completion rate"
              value={rate(totals.app_submits, totals.app_starts)}
              hint="Applications started that were submitted"
              tone="good"
              loading={overview.loading}
            />
            <StatTile
              label="Applications abandoned"
              value={number(totals.app_abandons)}
              hint={`${rate(totals.app_abandons, totals.app_starts)} of those started`}
              tone="warn"
              loading={overview.loading}
            />
          </div>
        </div>

        <SectionHeading
          title="Merchant application"
          description="The nine-step flow at /open-an-account. This is where the money is won or lost."
        />

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Panel
              accent
              title="Application funnel"
              subtitle="How many people reached each step, and how many left at each one."
            >
              <PanelState query={funnel} skeleton={9}>
                <StepFunnel rows={funnel.rows} />
              </PanelState>
            </Panel>
          </div>

          <div className="grid content-start gap-5 lg:col-span-2">
          <Panel title="Where applications are abandoned" subtitle="By the furthest step reached before leaving.">
            <PanelState query={dropoff}>
              <BarList
                rows={dropoff.rows}
                labelKey="step_name"
                valueKey="abandons"
                secondaryKey="avg_seconds"
                secondaryLabel="sec avg"
                emptyText="No abandonments recorded in this period."
                color={CRITICAL}
              />
            </PanelState>
          </Panel>

          <Panel title="Validation errors by step" subtitle="A step that throws errors is usually the step that leaks.">
            <PanelState query={errorsByStep}>
              <BarList
                rows={errorsByStep.rows}
                labelKey="step_name"
                valueKey="error_events"
                secondaryKey="people"
                secondaryLabel="people"
                emptyText="No validation errors recorded."
              />
            </PanelState>
          </Panel>
        </div>
      </div>

      <div className="mt-5">
        <Panel
          title="Abandoned applications to follow up"
          subtitle="Contact details captured before the applicant left. Anyone who later submitted is excluded."
        >
          <PanelState query={leads}>
            <DataTable
              rows={leads.rows}
              emptyText={
                Number(totals.app_abandons) > 0
                  ? `Nobody to follow up. There ${Number(totals.app_abandons) === 1 ? 'was 1 abandonment' : `were ${number(totals.app_abandons)} abandonments`} in this period, but each was either left before contact details were entered, or by someone who came back and submitted.`
                  : 'No abandoned applications in this period.'
              }
              columns={[
                { key: 'name', label: 'Name', render: (row) => row.name || '—' },
                { key: 'business', label: 'Business', render: (row) => row.business || '—' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
                {
                  key: 'furthest_step_name',
                  label: 'Left at',
                  render: (row) => `${row.furthest_step_name || '—'} (${row.furthest_step || '?'}/9)`,
                },
                {
                  key: 'last_seen',
                  label: 'Last seen',
                  render: (row) => (row.last_seen ? String(row.last_seen).slice(0, 16).replace('T', ' ') : '—'),
                },
              ]}
            />
          </PanelState>
        </Panel>
      </div>

      <SectionHeading
        title="Other website forms"
        description="Contact, careers, referral, partner program, product order and sign-in. The merchant application is a nine-step flow rather than a single form, so it is counted in the section above."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Forms started" value={number(totals.form_starts)} loading={overview.loading} />
        <StatTile
          label="Forms submitted"
          value={number(totals.form_submits)}
          hint={`${rate(totals.form_submits, totals.form_starts)} completion`}
          loading={overview.loading}
        />
        <StatTile label="Forms abandoned" value={number(totals.form_abandons)} tone="warn" loading={overview.loading} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Form completion" subtitle="Started versus submitted, per form. Excludes the merchant application.">
          <PanelState query={forms}>
            {forms.rows.length ? (
              <DataTable
                rows={forms.rows}
                columns={[
                  { key: 'form_name', label: 'Form' },
                  { key: 'started', label: 'Started', render: (row) => number(row.started) },
                  { key: 'submitted', label: 'Submitted', render: (row) => number(row.submitted) },
                  { key: 'abandoned', label: 'Abandoned', render: (row) => number(row.abandoned) },
                  { key: 'rate', label: 'Completion', render: (row) => rate(row.submitted, row.started) },
                ]}
              />
            ) : (
              <EmptyState>No form activity in this period.</EmptyState>
            )}
          </PanelState>
        </Panel>

        <Panel title="Last field before leaving" subtitle="The field people were on when they gave up.">
          <PanelState query={formFields}>
            <BarList
              rows={formFields.rows}
              labelKey="last_field"
              valueKey="abandons"
              emptyText="No form abandonments recorded."
              color={CRITICAL}
            />
          </PanelState>
        </Panel>
      </div>

      <SectionHeading title="Audience" description={`Where visitors came from over the last ${days} days.`} />

      <div className="grid gap-5">
        <Panel title="Daily traffic and applications" subtitle={`Last ${days} days.`}>
          <PanelState query={trend}>
            <TrendChart
              rows={trend.rows}
              series={[
                { key: 'visitors', label: 'Visitors', color: SERIES_1 },
                { key: 'app_starts', label: 'Applications started', color: SERIES_2 },
              ]}
            />
          </PanelState>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Top pages" subtitle="Where visitors spend their time.">
          <PanelState query={pages}>
            <BarList rows={pages.rows} labelKey="path" valueKey="views" secondaryKey="visitors" secondaryLabel="visitors" />
          </PanelState>
        </Panel>

        <Panel title="Where visitors come from" subtitle="Referring domain, or direct.">
          <PanelState query={sources}>
            <BarList rows={sources.rows} labelKey="source" valueKey="visitors" />
          </PanelState>
        </Panel>

        <Panel title="Campaigns" subtitle="Visitors arriving with UTM tags.">
          <PanelState query={campaigns}>
            <BarList
              rows={campaigns.rows}
              labelKey="utm_source"
              valueKey="visitors"
              emptyText="No tagged campaign traffic in this period."
            />
          </PanelState>
        </Panel>

        <Panel title="Devices and countries">
          <PanelState query={devices}>
            <BarList rows={devices.rows} labelKey="device" valueKey="visitors" />
          </PanelState>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <PanelState query={countries}>
              <BarList rows={countries.rows} labelKey="country" valueKey="visitors" />
            </PanelState>
          </div>
        </Panel>
      </div>

        <p className="mt-10 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-400">
          This dashboard reads analytics only. It holds no merchant or banking credential and cannot create, change or
          delete a customer record. Social security numbers, tax IDs, bank details and signatures are blocked before
          collection and are never present in this data.
        </p>
      </div>
    </div>
  )
}

export default function InsightsPage() {
  const [unlocked, setUnlocked] = useState(() => Boolean(getPassword()))

  const lock = () => {
    clearPassword()
    setUnlocked(false)
  }

  return (
    <>
      <Seo title="Site insights" description="Internal analytics dashboard." noindex />
      <div className="min-h-screen bg-slate-50">
        {unlocked ? <Dashboard onLock={lock} /> : <SignIn onUnlock={() => setUnlocked(true)} />}
      </div>
    </>
  )
}
