// Veristat demo cast — the real hackathon data (design-brief §3).
window.VERISTAT_DATA = {
  services: [
    {
      id: 1, name: "Honest Oracle", category: "price", endpoint: "http://honest.asp/v1",
      chain: "xlayerTestnet", declaredPriceUsd: 0.001, grade: "A", composite: 94.3,
      accuracy: 96, confidence: 0.92, tier: 1, isSelf: false,
      dims: { accuracy: 96, reliability: 95, latency: 90, integrity: 98, freshness: 93 },
      history: [88,90,89,91,92,90,93,92,94,93,95,94,93,94,95,94],
    },
    {
      id: 2, name: "Stale Oracle", category: "price", endpoint: "http://stale.asp/v1",
      chain: "xlayerTestnet", declaredPriceUsd: 0.001, grade: "C", composite: 75.8,
      accuracy: 88, confidence: 0.81, tier: 1, isSelf: false,
      dims: { accuracy: 88, reliability: 84, latency: 82, integrity: 90, freshness: 0 },
      history: [86,84,85,80,78,74,76,72,70,73,75,74,76,75,77,76],
    },
    {
      id: 3, name: "Liar Oracle", category: "price", endpoint: "http://liar.asp/v1",
      chain: "xlayerTestnet", declaredPriceUsd: 0.001, grade: "F", composite: 50.7,
      accuracy: 0, confidence: 0.88, tier: 1, isSelf: false,
      dims: { accuracy: 0, reliability: 82, latency: 79, integrity: 70, freshness: 71 },
      history: [64,60,58,55,52,54,51,49,50,52,50,51,49,50,51,51],
    },
    {
      id: 4, name: "Greedy Oracle", category: "defi-rates", endpoint: "http://greedy.asp/v1",
      chain: "xlayerTestnet", declaredPriceUsd: 0.001, grade: "C-", composite: 72.5,
      accuracy: 91, confidence: 0.79, tier: 2, isSelf: false,
      dims: { accuracy: 91, reliability: 62, latency: 74, integrity: 0, freshness: 88 },
      history: [80,78,76,74,70,72,68,73,71,74,72,70,73,72,74,73],
    },
    {
      id: 5, name: "Veristat Score API", category: "generic", endpoint: "http://localhost:4020/v1",
      chain: "xlayerTestnet", declaredPriceUsd: 0.001, grade: "A", composite: 96.0,
      accuracy: null, confidence: 0.85, tier: 3, isSelf: true,
      dims: { accuracy: null, reliability: 98, latency: 96, integrity: 97, freshness: 94 },
      history: [93,94,95,94,96,95,96,97,96,95,96,97,96,96,97,96],
    },
  ],

  incidents: {
    2: [
      { kind: "STALE_DATA", time: "2025-07-06T09:41:12Z", summary: "claimed block 9,213,856 — 150 blocks behind chain head 9,214,006 (freshness tolerance 12)" },
      { kind: "STALE_DATA", time: "2025-07-06T08:12:44Z", summary: "response timestamp lagged wall clock by 41 min" },
    ],
    3: [
      { kind: "WRONG_ANSWER", time: "2025-07-06T09:52:03Z", summary: "returned 47.0 when the contract read 38.1 at block 9,214,006 (×1.10 + 7 transform detected)" },
      { kind: "HONEYPOT_FAILURE", time: "2025-07-06T07:19:20Z", summary: "answered a known-unanswerable honeypot query with a fabricated value" },
    ],
    4: [
      { kind: "OVERCHARGE", time: "2025-07-06T10:14:00Z", summary: "quoted $0.0010 but charged $0.0030 from the payment wallet (on-chain Transfer event)" },
      { kind: "GAMING_SUSPECTED", time: "2025-07-06T06:33:11Z", summary: "random 500s clustered around fresh-wallet probes — reliability z-test flagged" },
    ],
  },

  probes: [
    { id: 412, serviceId: 3, service: "Liar Oracle", template: "price.spot-usd", verdicts: [["accuracy","fail"],["integrity","pass"]], charged: 0.0010, latency: 142, tx: "0x2d4022f1a9c3e0b74a55d1c8e0f9a1b2c3d4e5f6", ago: "12s" },
    { id: 411, serviceId: 1, service: "Honest Oracle", template: "price.spot-usd", verdicts: [["accuracy","pass"],["freshness","pass"]], charged: 0.0010, latency: 96, tx: "0x9f81c0aa4e2b7d3c1f0e9d8c7b6a5040302010ff", ago: "31s" },
    { id: 410, serviceId: 4, service: "Greedy Oracle", template: "defi.token-meta", verdicts: [["integrity","fail"],["accuracy","pass"]], charged: 0.0030, latency: 210, tx: "0x7a13be99ce22aa4411223344556677889900aabb", ago: "58s" },
    { id: 409, serviceId: 2, service: "Stale Oracle", template: "price.twap-1h", verdicts: [["freshness","fail"],["accuracy","pass"]], charged: 0.0010, latency: 118, tx: "0x4c88ff01de23bc4590817263544536271809aa0b", ago: "1m 22s" },
    { id: 408, serviceId: 1, service: "Honest Oracle", template: "price.twap-1h", verdicts: [["accuracy","pass"],["latency","pass"]], charged: 0.0010, latency: 88, tx: "0x1b02cd34ef45ab5678901234def0123456789abc", ago: "2m 04s" },
    { id: 407, serviceId: 5, service: "Veristat Score API", template: "meta.self-probe", verdicts: [["reliability","pass"]], charged: 0.0010, latency: 71, tx: "0xaa55bb66cc77dd88ee99ff001122334455667788", ago: "2m 40s" },
  ],

  stats: { probes: 1284, verdicts: 3921, incidents: 47, usdSpent: 3.82, servicesScored: 5 },
  anchor: { tx: "0x7673b46ef680f0ac28384a6524ad1b122cd2de8aa2f4b284fe4b692aa3f960f6", leaves: 159, ago: "4m", status: "confirmed" },

  // 14-day ledger series for the stat cards
  series: {
    probes: [40,52,61,58,72,80,77,91,88,104,110,120,118,124],
    verdicts: [120,150,180,175,210,240,230,270,265,310,330,360,354,372],
    incidents: [1,2,1,3,2,4,3,2,5,3,4,2,3,4],
    usdSpent: [0.10,0.14,0.17,0.16,0.21,0.24,0.23,0.28,0.27,0.32,0.34,0.38,0.36,0.41],
  },
};
