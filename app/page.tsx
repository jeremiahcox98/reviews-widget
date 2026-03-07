import { AuthStatus } from "@/components/AuthStatus";
import { ConnectGoogle } from "@/components/ConnectGoogle";
import { DownloadReviewsJson } from "@/components/DownloadReviewsJson";
import { EmbedPreview } from "@/components/EmbedPreview";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col gap-8 bg-muted/30 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Reviews widget preview</h1>
        <p className="mt-2 text-muted-foreground">
          Connect with Google to show real reviews, or view the embed with sample data.
        </p>
      </div>
      <div className="w-full max-w-4xl space-y-6">
        <ConnectGoogle />
        <AuthStatus />
        <DownloadReviewsJson />
        <EmbedPreview />
      </div>
    </div>
  );
}