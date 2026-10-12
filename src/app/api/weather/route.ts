import { OpenWeatherMapProvider } from "@/lib/openweathermap-provider";
import { createWeatherHandler } from "@/lib/weather-route-handler";
import { WeatherProvider } from "@/lib/weather-provider";

function buildProvider(): WeatherProvider {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY is not configured.");
  }
  return new OpenWeatherMapProvider(apiKey);
}

export const GET = createWeatherHandler(buildProvider);
