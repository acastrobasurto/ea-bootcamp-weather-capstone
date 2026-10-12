import { getOpenWeatherApiKey } from "@/lib/env";
import { OpenWeatherMapProvider } from "@/lib/openweathermap-provider";
import { createWeatherHandler } from "@/lib/weather-route-handler";
import { WeatherProvider } from "@/lib/weather-provider";

function buildProvider(): WeatherProvider {
  // Throws MissingEnvVarError (logged server-side, never sent to the
  // client) if OPENWEATHER_API_KEY is not configured.
  const apiKey = getOpenWeatherApiKey();
  return new OpenWeatherMapProvider(apiKey);
}

export const GET = createWeatherHandler(buildProvider);
