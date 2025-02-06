// Create a global navigator object definition so we can detect if we're running inside a Cloudflare Worker.
// While Cloudflare's types don't define a navigator object, it's available in the global scope.
declare global {
  // Provide a minimal definition for navigator
  interface Navigator {
    userAgent: string
  }

  // Define a global navigator (polyfill it at runtime if needed)
  var navigator: Navigator
}

export {}
