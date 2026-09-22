import { Archivo, Hanken_Grotesk } from "next/font/google";
import { ReviewsSection } from "@/components/ReviewsSection";
import "./embed.css";

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
});

export const metadata = {
  title: "Reviews",
  robots: "noindex, nofollow",
};

export default function EmbedPage() {
  return (
    <div
      className={`embed-page relative min-h-full w-full max-w-full overflow-x-hidden ${archivo.variable} ${hanken.variable}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/tpi-background.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#0a1520]/72" aria-hidden />

      <div className="relative z-10 overflow-x-hidden">
        <header className="embed-head">
          <p className="embed-trust">
            <span className="embed-trust__stars" aria-hidden>
              ★★★★★
            </span>
            Rated 5.0 <span className="embed-trust__sep">·</span> TPI Certified{" "}
            <span className="embed-trust__sep">·</span> Franklin, TN
          </p>
          <p className="embed-eyebrow">Real Results</p>
          <h2 className="embed-title">Golfers Who Move &amp; Play Better</h2>
          <p className="embed-lead">
            Local golfers share how the TPI screen and personalized plan helped them move better,
            play with more confidence, and get back on the course without pain.
          </p>
        </header>

        <div className="embed-marquee">
          <ReviewsSection />
        </div>

        <p className="embed-footnote">
          Verified Google reviews · Mason Chiropractic · Franklin, TN
        </p>
      </div>
    </div>
  );
}
