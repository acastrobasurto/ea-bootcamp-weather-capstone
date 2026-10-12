import type { City } from "./cities";
import {
  WeatherProvider,
  WeatherProviderError,
  WeatherSnapshot,
} from "./weather-provider";

interface OpenWeatherMapResponse {
  main: { temp: number; humidity: number };
  weather: { description: string }[];
  wind: { speed: number };
  dt: number;
}

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

/**
 * WeatherProvider implementation backed by the OpenWeatherMap "Current
 * Weather Data" API (https://openweathermap.org/current). The API key is
 * injected via the constructor (never read from process.env here), which
 * keeps this class easy to unit test and keeps secret-handling the
 * responsibility of whoever constructs it (the route handler).
 */
export class OpenWeatherMapProvider implements WeatherProvider {
  constructor(
    private readonly apiKey: string,
    private readonly fetchFn: typeof fetch = fetch
  ) {}

  async getCurrentWeather(
    city: Pick<City, "id" | "latitude" | "longitude">
  ): Promise<WeatherSnapshot> {
    const url = new URL(BASE_URL);
    url.searchParams.set("lat", String(city.latitude));
    url.searchParams.set("lon", String(city.longitude));
    url.searchParams.set("appid", this.apiKey);
    url.searchParams.set("units", "imperial");

    let response: Awaited<ReturnType<typeof fetch>>;
    try {
      response = await this.fetchFn(url.toString());
    } catch {
      throw new WeatherProviderError(
        "Unable to reach the weather provider. Please try again shortly."
      );
    }

    if (!response.ok) {
      throw new WeatherProviderError(
        "The weather provider returned an error response."
      );
    }

    let data: OpenWeatherMapResponse;
    try {
      data = (await response.json()) as OpenWeatherMapResponse;
    } catch {
      throw new WeatherProviderError(
        "The weather provider returned an unexpected response."
      );
    }

    return {
      cityId: city.id,
      temperatureF: data.main.temp,
      description: data.weather[0]?.description ?? "unknown",
      humidityPercent: data.main.humidity,
      windSpeedMph: data.wind.speed,
      observedAt: new Date(data.dt * 1000).toISOString(),
    };
  }
}
