"use client";

import { useEffect, useState } from "react";

type Status = {
  hasCookie?: boolean;
  refreshOk?: boolean;
  error?: string | null;
  hint?: string;
};

export function AuthStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/status", { credentials: "include" })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ error: "Request failed" }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!status) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-card-foreground">
      <p className="mb-2 text-sm font-medium">Session status (for debugging)</p>
      <pre className="overflow-x-auto rounded bg-muted/50 p-3 text-xs">
        {JSON.stringify(
          {
            hasCookie: status.hasCookie,
            refreshOk: status.refreshOk,
            error: status.error ?? null,
            hint: status.hint ?? null,
          },
          null,
          2
        )}
      </pre>
      {status.hint && (
        <p className="mt-2 text-xs text-muted-foreground">{status.hint}</p>
      )}
    </div>
  );
}
