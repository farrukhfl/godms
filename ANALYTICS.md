# Analytics & the insights dashboard

Read-only traffic, form and merchant-application analytics for godms.com, plus
an internal dashboard at `/insights`.

Nothing here can create, change or delete a customer record. The dashboard holds
no DRMS or merchant credential of any kind.

---

## 1. Create the PostHog project

1. Sign up at [posthog.com](https://posthog.com) and choose the **US Cloud**
   region. Do not pick EU — the site's visitors and records are US-based.
2. Create a project for `godms.com`.
3. Copy **Project Settings → Project API key** (starts with `phc_`). This is a
   publishable ingestion key and is *expected* to be visible in the browser.
4. Create **Settings → Personal API keys → New key**, scoped to **read** for
   this project only (starts with `phx_`). This one is secret.
5. Note the numeric **project id** from the URL:
   `app.posthog.com/project/<id>/...`

Sign PostHog's Data Processing Agreement (Settings → Organization → Legal).
That is what makes them a service provider rather than a third party you have
sold data to, which is the distinction CCPA cares about.

---

## 2. Environment variables

| Variable | Where | Secret? | Purpose |
|---|---|---|---|
| `VITE_POSTHOG_KEY` | build + runtime | No — public by design | Ingestion key |
| `VITE_POSTHOG_HOST` | build + runtime | No | `https://us.i.posthog.com` |
| `POSTHOG_READ_KEY` | server only | **Yes** | Personal API key, read scope |
| `POSTHOG_PROJECT_ID` | server only | No | Numeric project id |
| `POSTHOG_API_HOST` | server only | No | `https://us.posthog.com` |
| `INSIGHTS_PASSWORD` | server only | **Yes** | Password for `/insights` |

**The `VITE_` prefix is the dividing line.** Vite inlines every `VITE_*`
variable into the public JavaScript bundle at build time. A secret given a
`VITE_` prefix is published to every visitor. `POSTHOG_READ_KEY` and
`INSIGHTS_PASSWORD` must never carry that prefix.

Leaving `VITE_POSTHOG_KEY` empty disables tracking entirely — useful for local
development, where you usually do not want to pollute production figures.

On Vercel: Project → Settings → Environment Variables. Add all six.

---

## 3. What is collected

Page views on every route, with referrer, UTM tags, device and country.

Forms (contact, careers, referral, partner program, product order) report
`form_started`, `form_submitted` and `form_abandoned`, with the **name** of the
last field touched and how many fields were completed. Field *values* are never
read.

The merchant application reports, per step:

| Event | Meaning |
|---|---|
| `application_started` | Someone entered the flow |
| `application_step_viewed` | Reached step N of 9 |
| `application_step_completed` | Moved from step N to N+1 |
| `application_step_back` | Went back a step |
| `application_step_error` | Validation failed, with the field names |
| `application_abandoned` | Left, with the furthest step reached |
| `application_submitted` | Finished |

Once an applicant enters an email address, their name, business name, email and
phone are attached so the dashboard can list abandoned applications for
follow-up.

### What is never collected

Social security numbers, tax IDs and EINs, bank account and routing numbers,
uploaded documents, drawn signatures, driver's licences, and card data.

This is enforced in code at the capture boundary by
[`src/analytics/redact.js`](src/analytics/redact.js), not by convention. Two
independent guards apply to every event:

- **Key guard** — property names are normalized (`bankName` → `bank name`) and
  matched against an anchored pattern list.
- **Value guard** — any value shaped like an SSN, EIN, long digit run, `data:`
  URL or PEM block is dropped regardless of which field it arrived in.

Person profiles are built from a strict **allowlist** (`email`, `phone`, `name`,
`firstName`, `lastName`, `businessName`). A field added to the application later
is not collected unless someone adds it to that list deliberately.

**Session replay is disabled at the source**, not masked. US wiretapping claims
under CIPA (California) and WESCA (Pennsylvania) target replay specifically, and
this flow carries GLBA-regulated data.

Global Privacy Control and Do Not Track are honored as binding opt-outs.

---

## 4. The dashboard

`https://<host>/insights`, password-protected, excluded from `robots.txt` and
marked `noindex`. It renders outside the site layout and carries no navigation
link — nothing on the public site points to it.

Why it needs a server function: PostHog's `/api/projects/*` endpoints are not
CORS-enabled for browsers, and a read key placed in the bundle would be public.
[`api/insights-query.js`](api/insights-query.js) holds the key server-side.

It accepts a **query name**, never SQL. The thirteen queries are fixed in that
file, all `SELECT`. A caller cannot craft a query, and the function has no
credential for anything except PostHog reads.

### Hosting

Tracking works anywhere, because it runs in the browser. The **dashboard** needs
somewhere that can execute server code, and that is the one part static hosting
cannot provide.

`api/insights-query.js` is a Vercel serverless function. On `godms.vercel.app`
it works untouched. **SiteGround cannot run it**: it answers every path with
`index.html`, so a request to `/api/insights-query` returns the web page with a
200. Earlier this silently produced a dashboard of zeros; it now says plainly
that the endpoint is unavailable.

To use the dashboard from a statically hosted site, point it at a deployment
that does run the function:

1. On the **Vercel** project, set
   `INSIGHTS_ALLOWED_ORIGINS=https://godms.com,https://www.godms.com`
2. Build the **SiteGround** bundle with
   `VITE_INSIGHTS_API_URL=https://godms.vercel.app/api/insights-query`
3. Upload that build.

The URL is not a secret - the read key and password stay on the server, and the
password is still required on every request. The dashboard asks about the site
it is served from, not the one answering, so godms.com shows production figures
even though Vercel answers the call.

The alternatives are SiteGround's Node.js app support, or your own backend once
it exists, at which point this function can be retired.

The dashboard's password lives in `sessionStorage` only, so it is gone when the
tab closes and is never written into the bundle.

---

## 5. Verifying it works

```bash
npm run build          # must pass
grep -r "phx_" dist/   # must return nothing
```

After deploying, open the site, click through a couple of pages, start the
application and leave at step 3. Within a minute PostHog → Activity should show
`$pageview`, `application_started`, `application_step_viewed` and
`application_abandoned`. Then open `/insights`.

If a panel shows an error, the HogQL for that one query needs adjusting — each
panel fails independently, so the rest of the dashboard keeps working.

---

## 6. Removing it

Delete `src/analytics/`, remove the four call sites (`src/main.jsx`,
`src/components/layout/Layout.jsx`, `src/features/account-application/ApplicationFlow.jsx`,
`src/pages/OpenAccountPage.jsx`), and the site behaves exactly as it did before.
No form logic, validation, submit path or API payload was modified to add any of
this.
