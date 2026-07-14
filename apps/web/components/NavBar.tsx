"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Site navigation. Sticky glass bar, active-page underline, hover/focus
 * dropdowns for API and About — matching the approved reference design.
 */

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

function Caret() {
  return (
    <svg width="9" height="6" viewBox="0 0 9 6" fill="none" aria-hidden className="caret">
      <path d="M1 1.25 4.5 4.75 8 1.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface MenuItem {
  href: string;
  title: string;
  desc: string;
}

function Dropdown({ label, active, items }: { label: string; active: boolean; items: MenuItem[] }) {
  return (
    <div className="dropdown">
      <button type="button" className={`nav-link${active ? " active" : ""}`}>
        {label} <Caret />
      </button>
      <div className="dropdown-menu" role="menu">
        {items.map((it) => (
          <Link key={it.title} href={it.href} role="menuitem">
            <span className="t">{it.title}</span>
            <span className="d">{it.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const API_ITEMS: MenuItem[] = [
  { href: "/docs#api", title: "REST API", desc: "Paid x402 score & evidence endpoints" },
  { href: "/docs#sdk", title: "SDK", desc: "guard() — the pre-purchase gate" },
  { href: "/docs#alerts", title: "Webhooks", desc: "Degradation & incident alerts" },
  { href: "/docs#verify", title: "Proof verifier", desc: "Recompute any verdict on-chain" },
];

const ABOUT_ITEMS: MenuItem[] = [
  { href: "/methodology", title: "Methodology", desc: "How the five dimensions are measured" },
  { href: "/neutrality", title: "Neutrality policy", desc: "Providers can never pay for a score" },
  { href: "/report", title: "Market report", desc: "The State of the Agent Marketplace" },
];

export function NavBar() {
  const pathname = usePathname();
  const is = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <header className="site">
      <div className="nav-inner">
        <Link href="/" className="logo">
          <LogoMark />
          VERISTAT
        </Link>
        <nav>
          <Link href="/leaderboard" className={`nav-link${is("/leaderboard") || is("/service") ? " active" : ""}`}>
            Leaderboard
          </Link>
          <Link href="/demo" className={`nav-link${is("/demo") ? " active" : ""}`}>
            Live Demo
          </Link>
          <Link href="/report" className={`nav-link${is("/report") ? " active" : ""}`}>
            Reports
          </Link>
          <Dropdown label="API" active={false} items={API_ITEMS} />
          <Link href="/docs#mcp" className="nav-link">
            MCP Server
          </Link>
          <Link href="/docs" className={`nav-link${is("/docs") ? " active" : ""}`}>
            Docs
          </Link>
          <Dropdown label="About" active={is("/methodology") || is("/neutrality")} items={ABOUT_ITEMS} />
        </nav>
        <Link href="/docs" className="btn-primary">
          Get Early Access <span aria-hidden>↗</span>
        </Link>
      </div>
    </header>
  );
}
