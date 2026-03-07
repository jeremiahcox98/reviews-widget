"use client";

import { useEffect } from "react";

const MESSAGE_TYPE = "reviews-embed-height";

export function EmbedHeightReporter() {
  useEffect(() => {
    if (typeof window === "undefined" || window === window.parent) return;

    const el = document.querySelector("[data-embed-widget]");
    if (!el) return;

    const sendHeight = () => {
      const height = el instanceof HTMLElement ? el.scrollHeight : 0;
      window.parent.postMessage({ type: MESSAGE_TYPE, height }, "*");
    };

    sendHeight();

    const observer = new ResizeObserver(sendHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return null;
}
