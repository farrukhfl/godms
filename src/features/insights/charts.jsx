import { useId, useMemo, useState } from 'react'
import { Inbox } from 'lucide-react'

// Categorical slots, validated for CVD separation, lightness, chroma and 3:1
// contrast against the white card surface these render on.
export const SERIES_1 = '#0C79F7' // brand blue - primary measure
export const SERIES_2 = '#eb6834' // orange - secondary measure

// Reserved status colour. It never stands in for a series, and it always ships
// beside a label so meaning never rests on hue alone.
export const CRITICAL = '#d03b3b'

const GRID = '#e2e8f0'
const SURFACE = '#ffffff'

const number = (value) => Number(value || 0).toLocaleString('en-US')
const percent = (value, total) => (total > 0 ? `${Math.round((value / total) * 100)}%` : '0%')

export function SectionHeading({ title, description, children }) {
  return (
    <div className="mb-4 mt-10 flex flex-wrap items-end justify-between gap-3 first:mt-0">
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-navy">{title}</h2>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

export function Panel({ title, subtitle, children, action, accent = false }) {
  return (
    <section
      className={`flex flex-col rounded-2xl border bg-white p-6 transition-shadow hover:shadow-md ${
        accent ? 'border-primary/25 shadow-soft' : 'border-slate-200/80 shadow-sm'
      }`}
    >
      {title ? (
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-bold leading-6 text-navy">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={title ? 'mt-5 flex-1' : 'flex-1'}>{children}</div>
    </section>
  )
}

/** A 28px trend line for a stat tile. Shape only - the tile carries the number. */
function Sparkline({ points, color }) {
  const id = useId()
  if (!points || points.length < 2) return null

  const values = points.map((value) => Number(value) || 0)
  const max = Math.max(...values, 1)
  const width = 120
  const height = 28
  const step = width / (values.length - 1)
  const coords = values.map((value, index) => [index * step, height - (value / max) * (height - 4) - 2])
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ')
  const last = coords[coords.length - 1]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-7 w-full" aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${height} ${line} ${width},${height}`} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  )
}

export function StatTile({ label, value, hint, tone = 'default', spark, sparkColor = SERIES_1, loading }) {
  const valueClass = tone === 'warn' ? 'text-[#d03b3b]' : tone === 'good' ? 'text-[#0ca30c]' : 'text-navy'

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-slate-400">{label}</p>
      {loading ? (
        <div className="mt-3 h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <p className={`mt-2 text-[34px] font-extrabold leading-none tabular-nums tracking-tight ${valueClass}`}>{value}</p>
      )}
      {hint ? <p className="mt-2 text-[13px] leading-5 text-slate-500">{hint}</p> : null}
      {spark && spark.length > 1 ? (
        <div className="mt-3 -mb-1 opacity-70 transition-opacity group-hover:opacity-100">
          <Sparkline points={spark} color={sparkColor} />
        </div>
      ) : null}
    </div>
  )
}

export function EmptyState({ children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
      <Inbox className="text-slate-300" size={22} />
      <p className="max-w-md text-sm leading-6 text-slate-500">{children}</p>
    </div>
  )
}

export function Skeleton({ rows = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index}>
          <div className="flex justify-between">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-10 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="mt-2 h-2.5 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

/**
 * Horizontal magnitude list. One series, so no legend box - the panel title
 * names the measure. Values ride the bar tips.
 */
export function BarList({ rows, labelKey, valueKey, secondaryKey, secondaryLabel, emptyText = 'No data yet.', color = SERIES_1 }) {
  if (!rows.length) return <EmptyState>{emptyText}</EmptyState>
  const max = Math.max(...rows.map((row) => Number(row[valueKey]) || 0), 1)

  return (
    <ul className="space-y-3.5">
      {rows.map((row, index) => {
        const value = Number(row[valueKey]) || 0
        const width = Math.max((value / max) * 100, 2)
        return (
          <li key={`${row[labelKey]}-${index}`} className="group/row">
            <div className="flex items-baseline justify-between gap-4">
              <span className="flex min-w-0 items-baseline gap-2">
                <span className="w-4 shrink-0 text-[11px] font-bold tabular-nums text-slate-300">{index + 1}</span>
                <span className="truncate text-sm font-semibold text-slate-700" title={String(row[labelKey] ?? '')}>
                  {String(row[labelKey] ?? 'Unknown')}
                </span>
              </span>
              <span className="shrink-0 text-sm font-extrabold tabular-nums text-navy">
                {number(value)}
                {secondaryKey ? (
                  <span className="ml-2 text-[13px] font-semibold text-slate-400">
                    {number(row[secondaryKey])} {secondaryLabel}
                  </span>
                ) : null}
              </span>
            </div>
            {/* 10px bar, 4px rounded data-end, square at the baseline. */}
            <div className="ml-6 mt-1.5 h-2.5 overflow-hidden rounded-l-sm bg-slate-100">
              <div
                className="h-full rounded-r-[4px] transition-all duration-500"
                style={{ width: `${width}%`, backgroundColor: color }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * The application funnel: how many reached each step, and how many were lost
 * moving to the next one. Loss is the question this dashboard exists to answer,
 * so the worst leak is called out rather than left to be spotted.
 */
export function StepFunnel({ rows }) {
  if (!rows.length) return <EmptyState>No application activity in this period yet.</EmptyState>

  const entry = Math.max(...rows.map((row) => Number(row.reached) || 0), 1)

  const losses = rows.map((row, index) => {
    const reached = Number(row.reached) || 0
    const next = Number(rows[index + 1]?.reached) || 0
    return index < rows.length - 1 ? Math.max(reached - next, 0) : 0
  })
  const worstIndex = losses.indexOf(Math.max(...losses))
  const hasLoss = Math.max(...losses) > 0

  return (
    <ol className="space-y-1">
      {rows.map((row, index) => {
        const reached = Number(row.reached) || 0
        const lost = losses[index]
        const isWorst = hasLoss && index === worstIndex && lost > 0

        return (
          <li
            key={row.step_index ?? index}
            className={`relative rounded-xl px-3 py-2.5 transition-colors ${isWorst ? 'bg-rose-50/70' : 'hover:bg-slate-50'}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold tabular-nums ${
                    isWorst ? 'bg-[#d03b3b] text-white' : 'bg-navy/90 text-white'
                  }`}
                >
                  {row.step_index ?? index + 1}
                </span>
                <span className="truncate text-sm font-bold text-navy">{row.step_name || `Step ${index + 1}`}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="text-sm font-extrabold tabular-nums text-navy">{number(reached)}</span>
                <span className="text-[13px] font-semibold tabular-nums text-slate-400">{percent(reached, entry)}</span>
              </span>
            </div>

            <div className="ml-[34px] mt-2 h-3 overflow-hidden rounded-l-sm bg-slate-100">
              <div
                className="h-full rounded-r-[4px] transition-all duration-700"
                style={{ width: `${Math.max((reached / entry) * 100, 2)}%`, backgroundColor: SERIES_1 }}
              />
            </div>

            {lost > 0 ? (
              <p
                className={`ml-[34px] mt-1.5 flex items-center gap-1.5 text-xs font-bold ${
                  isWorst ? 'text-[#d03b3b]' : 'text-slate-400'
                }`}
              >
                <span aria-hidden="true">↓</span>
                {number(lost)} left here
                <span className="font-semibold">({percent(lost, reached)} of this step)</span>
                {isWorst ? (
                  <span className="ml-1 rounded-full bg-[#d03b3b] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                    Biggest leak
                  </span>
                ) : null}
              </p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Two-series trend. A legend is always present at two series; only the final
 * point of each line carries a direct label.
 */
export function TrendChart({ rows, series }) {
  const gradientId = useId()
  const [hover, setHover] = useState(null)

  const geometry = useMemo(() => {
    if (rows.length < 2) return null
    const width = 760
    const height = 240
    const padding = { top: 18, right: 60, bottom: 30, left: 46 }
    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom

    const max = Math.max(...rows.flatMap((row) => series.map((item) => Number(row[item.key]) || 0)), 1)
    const magnitude = Math.pow(10, Math.max(Math.floor(Math.log10(max)), 0))
    const ceiling = Math.ceil(max / magnitude) * magnitude || 1

    const x = (index) => padding.left + (rows.length === 1 ? plotWidth / 2 : (index / (rows.length - 1)) * plotWidth)
    const y = (value) => padding.top + plotHeight - ((Number(value) || 0) / ceiling) * plotHeight

    return { width, height, padding, plotHeight, plotWidth, ceiling, x, y }
  }, [rows, series])

  if (!geometry) {
    return <EmptyState>At least two days of data are needed to draw a trend. Check back tomorrow.</EmptyState>
  }

  const { width, height, padding, plotHeight, ceiling, x, y } = geometry
  const ticks = [0, ceiling / 2, ceiling]

  return (
    <figure className="m-0">
      <figcaption className="mb-4 flex flex-wrap gap-5">
        {series.map((item) => (
          <span key={item.key} className="flex items-center gap-2 text-[13px] font-bold text-slate-600">
            <span className="h-[3px] w-5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </figcaption>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-60 w-full"
        role="img"
        aria-label={`Daily trend of ${series.map((item) => item.label).join(' and ')}`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={series[0].color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={series[0].color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth="1" />
            <text x={padding.left - 10} y={y(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px] font-semibold tabular-nums">
              {number(Math.round(tick))}
            </text>
          </g>
        ))}

        {series.map((item, seriesIndex) => {
          const points = rows.map((row, index) => `${x(index)},${y(row[item.key])}`).join(' ')
          const lastIndex = rows.length - 1
          const lastValue = Number(rows[lastIndex][item.key]) || 0

          return (
            <g key={item.key}>
              {seriesIndex === 0 ? (
                <polygon
                  points={`${padding.left},${padding.top + plotHeight} ${points} ${x(lastIndex)},${padding.top + plotHeight}`}
                  fill={`url(#${gradientId})`}
                />
              ) : null}
              <polyline points={points} fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={x(lastIndex)} cy={y(lastValue)} r="4.5" fill={item.color} stroke={SURFACE} strokeWidth="2" />
              <text x={x(lastIndex) + 11} y={y(lastValue) + 4} className="fill-slate-500 text-[11px] font-extrabold tabular-nums">
                {number(lastValue)}
              </text>
            </g>
          )
        })}

        {rows.map((row, index) => {
          const band = geometry.plotWidth / Math.max(rows.length - 1, 1)
          return (
            <rect
              key={row.day ?? index}
              x={x(index) - band / 2}
              y={padding.top}
              width={band}
              height={plotHeight}
              fill="transparent"
              onMouseEnter={() => setHover(index)}
            />
          )
        })}

        {hover !== null ? (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={padding.top} y2={padding.top + plotHeight} stroke={GRID} strokeWidth="1" />
            {series.map((item) => (
              <circle key={item.key} cx={x(hover)} cy={y(rows[hover][item.key])} r="4.5" fill={item.color} stroke={SURFACE} strokeWidth="2" />
            ))}
          </g>
        ) : null}
      </svg>

      <p className="mt-3 min-h-[22px] text-sm text-slate-600" aria-live="polite">
        {hover !== null ? (
          <>
            <span className="font-extrabold text-navy">{String(rows[hover].day ?? '')}</span>
            {series.map((item) => (
              <span key={item.key} className="ml-4">
                {item.label}: <span className="font-extrabold tabular-nums text-navy">{number(rows[hover][item.key])}</span>
              </span>
            ))}
          </>
        ) : (
          <span className="text-slate-400">Hover the chart for a single day.</span>
        )}
      </p>
    </figure>
  )
}

/** Table view, so every value stays reachable without relying on colour. */
export function DataTable({ columns, rows, emptyText = 'Nothing to show yet.' }) {
  if (!rows.length) return <EmptyState>{emptyText}</EmptyState>

  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            {columns.map((column) => (
              <th key={column.key} className="px-1 pb-2.5 pr-4 text-[11px] font-extrabold uppercase tracking-[0.07em] text-slate-400">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className="px-1 py-3 pr-4 align-top font-medium text-slate-700">
                  {column.render ? column.render(row) : String(row[column.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
