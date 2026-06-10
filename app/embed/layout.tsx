import { EmbedHeightReporter } from "@/components/EmbedHeightReporter";

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-full w-full max-w-full overflow-x-hidden overscroll-x-none"
      data-embed-widget
    >
      {children}
      <EmbedHeightReporter />
    </div>
  );
}
