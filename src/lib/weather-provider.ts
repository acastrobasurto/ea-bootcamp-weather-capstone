import type { City } from "./cities";

export interface WeatherSnapshot {
  cityId: string;
  temperatureF: number;
  description: string;
  humidityPercent: number;
  windSpeedMph: number;
  observedAt: string;
}

/**
 * Abstraction over a current-weather data source. Concrete implementations
 * (e.g. OpenWeatherMapProvider) are injected wherever a WeatherProvider is
 * needed, keeping callers decoupled from any specific vendor (DIP/OCP).
 */
export interface WeatherProvider {
  getCurrentWeather(
    city: Pick<City, "id" | "latitude" | "longitude">
  ): Promise<WeatherSnapshot>;
}

/**
 * Error thrown by WeatherProvider implementations. Messages must always be
 * safe to show to/log for API clients - never include API keys or raw
 * upstream provider response bodies.
 */
export class WeatherProviderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "WeatherProviderError";
  }
}
