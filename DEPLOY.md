# Veristat — deployment

Frontend on **Vercel** (Next.js `apps/web`), backend on **Railway** (Postgres +
three Node services), all sharing one Railway Postgres.

```
Vercel:  web (Next.js)  ──reads──▶  Railway Postgres  ◀──writes──  worker (Railway)
                                          ▲                         │ probes
Railway: score-api (public x402) ────────┘         mock-asps (public) ◀┘
```

All three Railway services run the **same image** (root `Dockerfile`) with a
different start command.

## Railway services & start commands

| Service | Start command | Public? |
|---|---|---|
| Postgres | (managed plugin) | internal |
| mock-asps | `node demo/mock-asps/dist/main.js` | yes |
| score-api | `node apps/score-api/dist/main.js` | yes |
| worker | `node apps/worker/dist/main.js` | no |

## Environment variables

Shared (all three services): `DATABASE_URL` (Railway Postgres ref),
`XLAYER_TESTNET_USDT`, `EVIDENCE_ANCHOR_ADDRESS`, `IDENTITY_REGISTRY_ADDRESS`,
`VALIDATION_REGISTRY_ADDRESS`.

- **mock-asps**: `MOCK_ASP_CHAIN=xlayerTestnet`, `MOCK_ASP_PAYTO`, `PORT`.
- **score-api**: `SCORE_API_CHAIN=xlayerTestnet`, `SCORE_API_PAYTO`, `DEMO_MODE`,
  `PRICE_SCORE_USD`, `PRICE_CATEGORY_USD`, `PRICE_EVIDENCE_USD`, `PORT`,
  `PUBLIC_BASE_URL` (the Vercel URL).
- **worker** (only service with the key): `PROBE_MNEMONIC` (funded, testnet only),
  `ANCHOR_CHAIN`, `ATTEST_CHAIN`, `MOCK_ASP_URL` (deployed mock-asps URL),
  `BAZAAR_DISCOVERY_URL=http://localhost:1/disabled`, `MAX_PER_PROBE_USD=0.005`,
  conservative intervals, `PUBLIC_BASE_URL` (the Vercel URL).

**Vercel (web)**: `DATABASE_URL` (Railway Postgres **public** URL),
`PUBLIC_BASE_URL` (its own Vercel URL), `VERISTAT_API_URL` (score-api URL).
No mnemonic, ever.

## Probing a real OKX agent (your manual step)

By default the worker probes the four bundled mock ASPs. To have Veristat verify a
**real** agent from the OKX ecosystem (the strongest credibility signal for judges):

1. Register your paid service as an ASP at <https://www.okx.ai/tutorial/asp>. This is
   manual — okx.ai blocks automated fetches, so it can't be scripted.
2. Add the registered endpoint to `data/okx-asp-seed.json` (see
   `data/okx-asp-seed.example.json` for the shape). Use `category: "defi-rates"` so the
   accuracy templates apply; other categories are scored operationally only (Tier 3).
3. Redeploy the worker: `railway up --service worker`. The `okx_asp` discovery source
   picks up the seed on its next crawl (~15 min) and probes it like any other service.

The discovery plumbing (`okxAspSource` in `apps/worker/src/crawl/sources.ts`) is already
wired; only the registration + seed entry are manual.

## Secrets

`PROBE_MNEMONIC` is a **testnet-only** funded key. It lives in `.env` (gitignored)
and in the Railway *worker* service env (encrypted). It is never committed and
never set on Vercel.
