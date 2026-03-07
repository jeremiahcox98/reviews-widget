import { EmbedHeightReporter } from "@/components/EmbedHeightReporter";

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full w-full overflow-x-hidden" data-embed-widget>
      {children}
      <EmbedHeightReporter />
    </div>
  );
}