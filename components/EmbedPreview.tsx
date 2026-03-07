"use client";

import { useEffect, useRef, useState } from "react";

const MESSAGE_TYPE = "reviews-embed-height";

export function EmbedPreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onMessage = (e: MessageEvent) => {
      if (
        e.data &&
        e.data.type === MESSAGE_TYPE &&
        typeof e.data.height === "number"
      ) {
        setHeight(e.data.height);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src="/embed"
      title="Reviews"
      className="w-full rounded-lg border border-border bg-background shadow-sm"
      style={{ height: `${height}px`, display: "block" }}
    />
  );
}
