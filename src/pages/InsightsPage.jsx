import { useState } from 'react'
import { LockKeyhole, RefreshCw, TriangleAlert } from 'lucide-react'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import { APPLICATION_STEP_COUNT } from '../analytics/config'
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

/** Seconds are hard to read past a minute or two. */
const duration = (seconds) => {
  const total = Math.round(Number(seconds) || 0)
  if (!total) return '—'
  if (total < 60) return `${total}s`
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  if (minutes < 60) return rest ? `${minutes}m ${rest}s` : `${minutes}m`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

const when = (value) => (value ? String(value).slice(0, 16).replace('T', ' ') : '—')

/**
 * Distinguishes "we never asked" from "they left it blank". Someone who quit
 * before the Information step has no contact details by definition, and showing
 * a bare dash makes that look like missing data rather than an early exit.
 */
const notProvided = (row) => (
  <span className="text-slate-400">{Number(row.contactable) === 1 ? '—' : 'Not reached'}</span>
)

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
  const appSummary = useInsights('application_summary', days)
  const trend = useInsights('daily_trend', days)
  const funnel = useInsights('application_funnel', days)
  const dropoff = useInsights('application_dropoff', days)
  const errorsByStep = useInsights('application_errors', days)
  const errorFields = useInsights('application_error_fields', days)
  const stepTiming = useInsights('application_step_timing', days)
  const backSteps = useInsights('application_back_steps', days)
  const byDevice = useInsights('funnel_by_device', days)
  const failures = useInsights('application_failures', days)
  const services = useInsights('application_services', days)
  const planChoices = useInsights('application_plans', days)
  const siteErrors = useInsights('site_errors', days)
  const leads = useInsights('abandoned_leads', days)
  const forms = useInsights('form_performance', days)
  const formFields = useInsights('form_dropoff_fields', days)
  const pages = useInsights('top_pages', days)
  const sources = useInsights('traffic_sources', days)
  const campaigns = useInsights('campaigns', days)
  const devices = useInsights('devices', days)
  const countries = useInsights('countries', days)

  const all = [overview, appSummary, trend, funnel, dropoff, errorsByStep, errorFields, stepTiming,
    backSteps, byDevice, failures, services, planChoices, siteErrors, leads, forms, formFields,
    pages, sources, campaigns, devices, countries]
  const refreshAll = () => all.forEach((query) => query.refresh())

  const totals = overview.rows[0] || {}
  const app = appSummary.rows[0] || {}
  const contactableLeads = leads.rows.filter((row) => Number(row.contactable) === 1).length
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
              value={number(app.started)}
              hint={`${number(app.submitted)} submitted${Number(app.in_progress) > 0 ? ` · ${number(app.in_progress)} still in progress` : ''}`}
              loading={appSummary.loading}
              spark={spark('app_starts')}
              sparkColor={SERIES_2}
            />
            <StatTile
              label="Completion rate"
              value={rate(app.submitted, app.started)}
              hint="Applications started that were submitted"
              tone="good"
              loading={appSummary.loading}
            />
            <StatTile
              label="Applications abandoned"
              value={number(app.abandoned)}
              hint={`${rate(app.abandoned, app.started)} of those started`}
              tone="warn"
              loading={appSummary.loading}
            />
          </div>
        </div>

        <SectionHeading
          title="Merchant application"
          description={`The ${APPLICATION_STEP_COUNT}-step flow at /open-an-account. An application counts as abandoned once it has gone 30 minutes untouched without being submitted, so nothing is missed when a browser closes without warning.`}
        />

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Panel
              accent
              title="Application funnel"
              subtitle="How many people reached each step, and how many left at each one."
            >
              <PanelState query={funnel} skeleton={APPLICATION_STEP_COUNT}>
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
          title="Abandoned applications"
          subtitle={
            contactableLeads > 0
              ? `${number(contactableLeads)} of these left contact details and can be followed up; the rest quit before the Information step, so there is nobody to call. Anyone who later submitted is excluded.`
              : 'Everyone who started an application and did not finish. Contact details appear once an applicant reaches the Information step. Anyone who later submitted is excluded.'
          }
        >
          <PanelState query={leads}>
            <DataTable
              rows={leads.rows}
              emptyText="No abandoned applications in this period."
              columns={[
                { key: 'name', label: 'Name', render: (row) => row.name || notProvided(row) },
                { key: 'business', label: 'Business', render: (row) => row.business || notProvided(row) },
                { key: 'email', label: 'Email', render: (row) => row.email || notProvided(row) },
                { key: 'phone', label: 'Phone', render: (row) => row.phone || notProvided(row) },
                {
                  key: 'left_at_step_name',
                  label: 'Left at',
                  render: (row) =>
                    `${row.left_at_step_name || '—'} (${row.left_at_step || '?'} of ${row.total_steps || APPLICATION_STEP_COUNT})`,
                },
                { key: 'device', label: 'Device', render: (row) => row.device || '—' },
                { key: 'last_seen', label: 'Last seen', render: (row) => when(row.last_seen) },
              ]}
            />
          </PanelState>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel
          title="How long each step takes"
          subtitle="A step people linger on is usually a step they find hard. Compare the typical time against the worst case."
        >
          <PanelState query={stepTiming} skeleton={6}>
            <DataTable
              rows={stepTiming.rows}
              emptyText="No completed steps in this period yet."
              columns={[
                { key: 'step_name', label: 'Step', render: (row) => `${row.step_index}. ${row.step_name}` },
                { key: 'median_seconds', label: 'Typical', render: (row) => duration(row.median_seconds) },
                { key: 'avg_seconds', label: 'Average', render: (row) => duration(row.avg_seconds) },
                { key: 'slowest_seconds', label: 'Slowest', render: (row) => duration(row.slowest_seconds) },
              ]}
            />
          </PanelState>
        </Panel>

        <Panel
          title="Fields people get wrong"
          subtitle="The exact inputs that fail validation. These are usually fixable with a clearer label or input format."
        >
          <PanelState query={errorFields}>
            <BarList
              rows={errorFields.rows}
              labelKey="field"
              valueKey="failures"
              secondaryKey="people"
              secondaryLabel="people"
              emptyText="No validation errors recorded."
              color={CRITICAL}
            />
          </PanelState>
        </Panel>

        <Panel
          title="Phone versus computer"
          subtitle="A multi-step form with document uploads is far harder on a phone. If mobile completion lags, that is the fix with the most upside."
        >
          <PanelState query={byDevice} skeleton={3}>
            <DataTable
              rows={byDevice.rows}
              emptyText="No application activity in this period."
              columns={[
                { key: 'device', label: 'Device' },
                { key: 'started', label: 'Started', render: (row) => number(row.started) },
                {
                  key: 'avg_step_reached',
                  label: 'Average step reached',
                  render: (row) => `${row.avg_step_reached ?? '—'} of ${APPLICATION_STEP_COUNT}`,
                },
                { key: 'completed', label: 'Submitted', render: (row) => number(row.completed) },
                { key: 'through', label: 'Completion', render: (row) => rate(row.completed, row.started) },
              ]}
            />
          </PanelState>
        </Panel>

        <Panel
          title="Steps people go back to"
          subtitle="Going backwards means something earlier was unclear or entered wrongly."
        >
          <PanelState query={backSteps}>
            <BarList
              rows={backSteps.rows}
              labelKey="step_name"
              valueKey="times_back"
              secondaryKey="people"
              secondaryLabel="people"
              emptyText="Nobody has gone back a step in this period."
            />
          </PanelState>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel
          title="Applications blocked by an error on our side"
          subtitle="These merchants did not change their mind — something failed while they were trying to proceed. Anything appearing here is worth investigating today."
        >
          <PanelState query={failures} skeleton={3}>
            <DataTable
              rows={failures.rows}
              emptyText="No failed requests. Every applicant who left did so by choice."
              columns={[
                { key: 'step_name', label: 'Step', render: (row) => `${row.step_index}. ${row.step_name}` },
                { key: 'message', label: 'What the applicant saw' },
                { key: 'occurrences', label: 'Times', render: (row) => number(row.occurrences) },
                { key: 'people', label: 'People', render: (row) => number(row.people) },
                { key: 'last_seen', label: 'Last seen', render: (row) => when(row.last_seen) },
              ]}
            />
          </PanelState>
        </Panel>
      </div>

      <SectionHeading
        title="What applicants are asking for"
        description="Demand mix and pricing preference, taken from the choices made inside the application."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Services requested" subtitle="Selected on the first step. One applicant can choose several.">
          <PanelState query={services}>
            <BarList
              rows={services.rows}
              labelKey="service"
              valueKey="applicants"
              emptyText="No services recorded yet. This fills in as new applications come through."
            />
          </PanelState>
        </Panel>

        <Panel title="Pricing plans chosen" subtitle="Cash Discount, Surcharge, Interchange or Flat Rate.">
          <PanelState query={planChoices}>
            <BarList
              rows={planChoices.rows}
              labelKey="plan"
              valueKey="applicants"
              color={SERIES_2}
              emptyText="No plans recorded yet. This fills in as new applications reach the plan step."
            />
          </PanelState>
        </Panel>
      </div>

      <SectionHeading
        title="Other website forms"
        description={`Contact, careers, referral, partner program, product order and sign-in. The merchant application is a ${APPLICATION_STEP_COUNT}-step flow rather than a single form, so it is counted in the section above.`}
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

        <SectionHeading
          title="Site health"
          description="Problems real visitors hit in their browser, which otherwise only surface when someone phones in."
        />

        <Panel title="JavaScript errors" subtitle="Grouped by message and the page they happened on.">
          <PanelState query={siteErrors} skeleton={3}>
            <DataTable
              rows={siteErrors.rows}
              emptyText="No JavaScript errors recorded. The site is behaving for real visitors."
              columns={[
                { key: 'message', label: 'Error' },
                { key: 'path', label: 'Page' },
                { key: 'occurrences', label: 'Times', render: (row) => number(row.occurrences) },
                { key: 'people', label: 'People', render: (row) => number(row.people) },
                { key: 'last_seen', label: 'Last seen', render: (row) => when(row.last_seen) },
              ]}
            />
          </PanelState>
        </Panel>

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
