import { ReviewsSection } from "@/components/ReviewsSection";

export const metadata = {
  title: "Reviews",
  robots: "noindex, nofollow",
};

export default function EmbedPage() {
  return (
    <div className="relative min-h-full w-full">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/background.png)" }}
        aria-hidden
      />
      {/* 80% black overlay */}
      <div className="absolute inset-0 bg-black/80" aria-hidden />
      {/* Content above overlay */}
      <div className="relative z-10 py-6">
        <ReviewsSection />
      </div>
    </div>
  );
}
