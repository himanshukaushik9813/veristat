import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veristat — production auditor of the agent economy",
  description:
    "Independent verification layer for paid agent services: adversarial probes, on-chain ground truth, evidence-anchored scores.",
};

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <path
        d="M13 1.5 22.5 6v7.2c0 5.4-3.9 9.4-9.5 11.3C7.4 22.6 3.5 18.6 3.5 13.2V6L13 1.5Z"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8.8 13.2l2.9 2.9 5.5-5.9" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="site">
            <Link href="/" className="logo">
              <LogoMark />
              VERISTAT
            </Link>
            <nav>
              <Link href="/leaderboard">Leaderboard</Link>
              <Link href="/report">Reports</Link>
              <Link href="/docs#api">API</Link>
              <Link href="/docs#mcp">MCP Server</Link>
              <Link href="/docs">Docs</Link>
              <Link href="/neutrality">About</Link>
            </nav>
            <Link href="/docs" className="btn-primary">
              Get Early Access <span aria-hidden>↗</span>
            </Link>
          </header>
          {children}
          <footer className="site">
            Every score traces to on-chain payments and Merkle-anchored evidence on XLayer.
            Providers can never pay to change a score.
          </footer>
        </div>
      </body>
    </html>
  );
}
