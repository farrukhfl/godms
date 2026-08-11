# Dolphin Merchant Services

React/Vite marketing site with a separate Express API for contact and merchant-account submissions.

## Requirements

- Node.js 20 or newer
- npm

## Install

Install the frontend and backend dependencies separately:

```bash
npm install
npm --prefix server install
```

## Environment Setup

The API has working local defaults, but create a local server environment file before development:

```bash
cp server/.env.example server/.env
```

The default server configuration is:

```env
PORT=3001
ALLOWED_ORIGIN=http://localhost:5173
```

The frontend defaults to `http://localhost:3001`. To override the API URL, copy the root example file:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:3001
```

Vite environment values are embedded at build time. Restart the Vite process after changing `.env`.

## Development

Run the frontend only:

```bash
npm run dev
```

Run the API only:

```bash
npm run dev:server
```

Run the frontend and API together:

```bash
npm run dev:all
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:3001` by default. The API health endpoint is `GET /api/health`.

## API Endpoints

### Contact request

`POST /api/contact`

```json
{
  "name": "Sample Merchant",
  "businessName": "Sample Business",
  "phone": "(555) 555-0123",
  "email": "merchant@example.com",
  "solution": "POS Solutions",
  "message": "I would like a quote.",
  "website": ""
}
```

### Account application

`POST /api/account-applications`

```json
{
  "name": "Sample Merchant",
  "businessName": "Sample Business",
  "phone": "(555) 555-0123",
  "email": "merchant@example.com",
  "monthlyVolume": "$10,000 - $25,000",
  "preferredContact": "Email",
  "website": ""
}
```

Both endpoints validate input, limit each IP to five submissions per 15 minutes, and silently accept honeypot submissions without logging them. Valid submissions are logged as structured JSON until an email or CRM integration is added.

## Production Build

Build the frontend:

```bash
npm run build
```

Start the API without file watching:

```bash
npm --prefix server start
```

Before deployment, set `VITE_API_BASE_URL` to the public API origin when building the frontend. Set `ALLOWED_ORIGIN` on the API to the exact deployed frontend origin. Multiple allowed origins can be supplied as a comma-separated list.
