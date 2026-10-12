export class MissingEnvVarError extends Error {
  constructor(public readonly variableName: string) {
    super(
      `Missing required environment variable ${variableName}. ` +
        "Copy .env.example to .env.local and set your OpenWeatherMap API key " +
        "(get a free key at https://openweathermap.org/current)."
    );
    this.name = "MissingEnvVarError";
  }
}

/**
 * Reads the OpenWeatherMap API key from the server environment. Throws a
 * MissingEnvVarError (safe to log - never contains a secret) if it is not
 * set, so misconfiguration fails loudly instead of silently.
 */
export function getOpenWeatherApiKey(
  env: Record<string, string | undefined> = process.env
): string {
  const apiKey = env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new MissingEnvVarError("OPENWEATHER_API_KEY");
  }
  return apiKey;
}
