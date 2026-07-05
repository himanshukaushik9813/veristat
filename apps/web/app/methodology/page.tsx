import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

export const dynamic = "force-dynamic";

export async function DocPage({ file }: { file: string }) {
  const md = await readFile(path.join(process.cwd(), "..", "..", "docs", file), "utf8");
  const html = await marked.parse(md);
  return <main className="prose" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function Methodology() {
  return <DocPage file="methodology.md" />;
}
