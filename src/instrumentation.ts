/**
 * Next.js instrumentation hook - runs once when the server process starts
 * (https://nextjs.org/docs/app/guides/instrumentation). Used here to fail
 * fast and loudly if required configuration is missing, rather than only
 * discovering it later via a sanitized per-request 500 response.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getOpenWeatherApiKey } = await import("@/lib/env");
    // Throws MissingEnvVarError (crashing startup with a clear message)
    // if OPENWEATHER_API_KEY is not set in the server environment.
    getOpenWeatherApiKey();
  }
}
