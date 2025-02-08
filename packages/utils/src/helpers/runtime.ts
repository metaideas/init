export const isCloudflare =
  typeof navigator !== "undefined" &&
  navigator?.userAgent === "Cloudflare-Workers"
