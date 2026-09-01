# Deployment

HydroMonitor Lab is prepared for a Vercel deployment with a Vite/Lit frontend and a reused Express mock API.

## Local

Install dependencies:

```bash
npm ci
```

Run frontend and API together:

```bash
npm run dev:all
```

Local URLs:

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001`

For local development, `VITE_API_BASE_URL` can point to the standalone Express server:

```text
VITE_API_BASE_URL=http://localhost:3001/api
```

## Production / Vercel

1. Import the GitHub repository in Vercel.
2. Use the Vite framework preset if Vercel detects it.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Environment variables:
   - `VITE_API_BASE_URL` is optional in production.
   - If omitted, the frontend defaults to same-origin `/api`.
6. Deploy from the Vercel dashboard.
7. Test REST endpoints after deployment.
8. Test the SSE connection from the dashboard.

The Express routes are defined once in `mock-server/app.ts`. Local development starts them with `mock-server/server.ts`, while Vercel uses `api/index.ts` without calling `app.listen()`.

## Deployment Checklist

- [ ] home/dashboard loads
- [ ] `/api/stations` responds
- [ ] latest measurement responds
- [ ] historical measurements responds
- [ ] connection status reaches `CONNECTED`
- [ ] sensor cards change with SSE
- [ ] chart receives new points
- [ ] alarms keep working
- [ ] changing station closes the previous stream
- [ ] mobile layout works

## Mock SSE Limitations

The SSE endpoint is a simulation. It generates data in memory, uses timers, and each stream owns its own temporary state.

This is useful for a portfolio demo, but it is not a production backend. It does not persist measurements, recover stream gaps, or share state across independent function invocations.

If Vercel function limits become restrictive for long-lived SSE streams, keep the frontend configuration and deploy the Express/SSE backend separately on a process-oriented host.
