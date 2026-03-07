"use client";

export function ConnectGoogle() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <p className="mb-2 text-sm font-medium">Show your Google reviews</p>
      <p className="mb-3 text-xs text-muted-foreground">
        Connect with Google once. Your reviews will load in the widget and stay
        in sync — no pasting tokens.
      </p>
      <div className="flex items-center gap-3">
        <a
          href="/api/auth/google"
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Connect with Google
        </a>
        <a
          href="/api/auth/signout"
          className="text-sm text-muted-foreground hover:underline"
        >
          Disconnect
        </a>
      </div>
    </div>
  );
}
