import { Playfair_Display } from "next/font/google";
import { ReviewsSection } from "@/components/ReviewsSection";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

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
      <div className="relative z-10 py-6 pb-15 pt-15">
        <h2
          className={`mb-6 text-center text-[40px] font-medium leading-tight text-white md:text-[50px] ${playfair.className}`}
        >
          Don&apos;t Just Take Our Word For It
        </h2>
        <ReviewsSection />
      </div>
    </div>
  );
}
