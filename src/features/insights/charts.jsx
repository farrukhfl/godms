import { useId, useMemo, useState } from 'react'

// Brand-tuned categorical slots, validated for CVD separation and the
// lightness/chroma bands against a light surface.
export const SERIES_1 = '#0C79F7' // brand blue - primary measure
export const SERIES_2 = '#eb6834' // orange - secondary measure
export const LOST = '#e34948' // reserved status colour, drop-off only
const GRID = '#e2e8f0'
const SURFACE = '#ffffff'

const number = (value) => Number(value || 0).toLocaleString('en-US')
const percent = (value, total) => (total > 0 ? `${Math.round((value / total) * 100)}%` : '0%')

export function Panel({ title, subtitle, children, action }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm leading-5 text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export function StatTile({ label, value, hint, tone = 'default' }) {
  const toneClass = tone === 'warn' ? 'text-rose-600' : tone === 'good' ? 'text-emerald-600' : 'text-navy'
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold tabular-nums tracking-tight ${toneClass}`}>{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </div>
  )
}

export function EmptyState({ children }) {
  return <p className="py-8 text-center text-sm text-slate-500">{children}</p>
}

/**
 * Horizontal magnitude list. One series, so no legend box - the panel title
 * names the measure. Values ride the bar tips.
 */
export function BarList({ rows, labelKey, valueKey, secondaryKey, secondaryLabel, emptyText = 'No data yet.' }) {
  if (!rows.length) return <EmptyState>{emptyText}</EmptyState>
  const max = Math.max(...rows.map((row) => Number(row[valueKey]) || 0), 1)

  return (
    <ul className="space-y-3">
      {rows.map((row, index) => {
        const value = Number(row[valueKey]) || 0
        const width = Math.max((value / max) * 100, 1.5)
        return (
          <li key={`${row[labelKey]}-${index}`}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="truncate text-sm font-semibold text-slate-700" title={String(row[labelKey] ?? '')}>
                {String(row[labelKey] ?? 'Unknown')}
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-navy">
                {number(value)}
                {secondaryKey ? (
                  <span className="ml-2 font-semibold text-slate-400">
                    {number(row[secondaryKey])} {secondaryLabel}
                  </span>
                ) : null}
              </span>
            </div>
            {/* 10px bar, 4px rounded data-end, square at the baseline. */}
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-l-sm bg-slate-100">
              <div
                className="h-full rounded-r-[4px]"
                style={{ width: `${width}%`, backgroundColor: SERIES_1 }}
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
 * so it is labelled directly rather than left to the tooltip.
 */
export function StepFunnel({ rows }) {
  if (!rows.length) return <EmptyState>No application activity in this period yet.</EmptyState>

  const entry = Math.max(...rows.map((row) => Number(row.reached) || 0), 1)

  return (
    <ol className="space-y-4">
      {rows.map((row, index) => {
        const reached = Number(row.reached) || 0
        const next = Number(rows[index + 1]?.reached) || 0
        const lost = index < rows.length - 1 ? Math.max(reached - next, 0) : 0
        const lostShare = reached > 0 ? lost / reached : 0
        const isLeak = lostShare >= 0.25 && reached > 0

        return (
          <li key={row.step_index ?? index}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-slate-700">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold tabular-nums text-slate-500">
                  {row.step_index ?? index + 1}
                </span>
                {row.step_name || `Step ${index + 1}`}
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums text-navy">
                {number(reached)}
                <span className="ml-2 font-semibold text-slate-400">{percent(reached, entry)} of entry</span>
              </span>
            </div>

            <div className="mt-1.5 flex h-3 w-full gap-[2px] overflow-hidden rounded-l-sm bg-slate-100">
              <div
                className="h-full rounded-r-[4px]"
                style={{ width: `${Math.max((reached / entry) * 100, 1.5)}%`, backgroundColor: SERIES_1 }}
              />
            </div>

            {lost > 0 ? (
              <p className={`mt-1 text-xs font-semibold ${isLeak ? 'text-rose-600' : 'text-slate-400'}`}>
                {isLeak ? '▼ ' : ''}
                {number(lost)} left here ({percent(lost, reached)} of this step)
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
    const width = 720
    const height = 220
    const padding = { top: 16, right: 56, bottom: 28, left: 44 }
    const plotWidth = width - padding.left - padding.right
    const plotHeight = height - padding.top - padding.bottom

    const max = Math.max(
      ...rows.flatMap((row) => series.map((item) => Number(row[item.key]) || 0)),
      1,
    )
    // Round the ceiling to a clean tick value.
    const magnitude = Math.pow(10, Math.max(Math.floor(Math.log10(max)), 0))
    const ceiling = Math.ceil(max / magnitude) * magnitude || 1

    const x = (index) => padding.left + (rows.length === 1 ? plotWidth / 2 : (index / (rows.length - 1)) * plotWidth)
    const y = (value) => padding.top + plotHeight - (Number(value) || 0) / ceiling * plotHeight

    return { width, height, padding, plotHeight, plotWidth, ceiling, x, y }
  }, [rows, series])

  if (!geometry) return <EmptyState>Not enough days of data to draw a trend yet.</EmptyState>

  const { width, height, padding, plotHeight, ceiling, x, y } = geometry
  const ticks = [0, ceiling / 2, ceiling]

  return (
    <figure className="m-0">
      <figcaption className="mb-3 flex flex-wrap gap-4">
        {series.map((item) => (
          <span key={item.key} className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <span className="h-[3px] w-4 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            {item.label}
          </span>
        ))}
      </figcaption>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full"
        role="img"
        aria-label={`Daily trend of ${series.map((item) => item.label).join(' and ')}`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={series[0].color} stopOpacity="0.16" />
            <stop offset="100%" stopColor={series[0].color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Recessive hairline grid. */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} stroke={GRID} strokeWidth="1" />
            <text x={padding.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-slate-400 text-[11px] tabular-nums">
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
              <polyline
                points={points}
                fill="none"
                stroke={item.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* End marker: r >= 4 with a 2px surface ring. */}
              <circle cx={x(lastIndex)} cy={y(lastValue)} r="4.5" fill={item.color} stroke={SURFACE} strokeWidth="2" />
              <text
                x={x(lastIndex) + 10}
                y={y(lastValue) + 4}
                className="fill-slate-500 text-[11px] font-bold tabular-nums"
              >
                {number(lastValue)}
              </text>
            </g>
          )
        })}

        {/* Hover layer: a full-height hit band per day, wider than the marks. */}
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
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={padding.top}
              y2={padding.top + plotHeight}
              stroke={GRID}
              strokeWidth="1"
            />
            {series.map((item) => (
              <circle
                key={item.key}
                cx={x(hover)}
                cy={y(rows[hover][item.key])}
                r="4.5"
                fill={item.color}
                stroke={SURFACE}
                strokeWidth="2"
              />
            ))}
          </g>
        ) : null}
      </svg>

      <p className="mt-2 min-h-[20px] text-sm text-slate-600" aria-live="polite">
        {hover !== null ? (
          <>
            <span className="font-bold text-navy">{String(rows[hover].day ?? '')}</span>
            {series.map((item) => (
              <span key={item.key} className="ml-3">
                {item.label}: <span className="font-bold tabular-nums">{number(rows[hover][item.key])}</span>
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
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left">
            {columns.map((column) => (
              <th key={column.key} className="pb-2 pr-4 font-bold text-slate-500">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-100 last:border-0">
              {columns.map((column) => (
                <td key={column.key} className="py-2.5 pr-4 align-top text-slate-700">
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
