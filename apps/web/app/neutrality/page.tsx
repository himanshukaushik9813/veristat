import { DocPage } from "@/components/DocPage";

export const dynamic = "force-dynamic";

export default function Neutrality() {
  return (
    <>
      <DocPage file="neutrality-policy.md" />
      <DocPage file="dispute-process.md" />
    </>
  );
}
