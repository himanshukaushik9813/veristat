import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const SITE_URL = process.env.PUBLIC_BASE_URL ?? "https://veristat-two.vercel.app";
const DESCRIPTION =
  "Independent verification layer for paid agent services: adversarial probes paid on-chain, verified against on-chain ground truth, scored on five dimensions, and Merkle-anchored on XLayer.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Veristat — production auditor of the agent economy",
    template: "%s · Veristat",
  },
  description: DESCRIPTION,
  applicationName: "Veristat",
  keywords: ["agent economy", "x402", "XLayer", "ERC-8004", "verification", "OKX", "AI agents"],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Veristat — production auditor of the agent economy",
    description: DESCRIPTION,
    siteName: "Veristat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veristat — production auditor of the agent economy",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <div className="container">
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
