const configuredApiBase = (process.env.NEXT_PUBLIC_API_BASE ?? "").trim();
const forceSameOriginApi =
  (process.env.NEXT_PUBLIC_FORCE_SAME_ORIGIN_API ?? "true").toLowerCase() !==
  "false";
const isAbsoluteApiBase = /^https?:\/\//i.test(configuredApiBase);

// Default to same-origin in production to avoid browser CORS errors.
export const API_BASE =
  forceSameOriginApi && isAbsoluteApiBase ? "" : configuredApiBase;

export const WS_BASE =
  process.env.NEXT_PUBLIC_WS_BASE ||
  (typeof window !== "undefined"
    ? window.location.protocol === "https:"
      ? `wss://${window.location.host}`
      : `ws://${window.location.host}`
    : "wss://api.telisik.org");
