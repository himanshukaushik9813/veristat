import type { Metadata } from "next";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Veristat — production auditor of the agent economy",
  description:
    "Independent verification layer for paid agent services: adversarial probes, on-chain ground truth, evidence-anchored scores.",
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
