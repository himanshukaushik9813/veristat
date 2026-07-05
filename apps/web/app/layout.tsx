import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veristat — production auditor of the agent economy",
  description:
    "Independent verification layer for paid agent services: adversarial probes, on-chain ground truth, evidence-anchored scores.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="site">
            <Link href="/" className="logo">
              veri<span>stat</span>
            </Link>
            <nav>
              <Link href="/">Leaderboard</Link>
              <Link href="/report">Report</Link>
              <Link href="/methodology">Methodology</Link>
              <Link href="/neutrality">Neutrality</Link>
            </nav>
            <span className="tagline">unannounced · evidence-based · neutral</span>
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
