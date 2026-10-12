import type { WeatherSnapshot } from "@/lib/weather-provider";

interface WeatherDisplayProps {
  cityName: string;
  snapshot: WeatherSnapshot | null;
  isLoading: boolean;
  error: string | null;
}

export function WeatherDisplay({
  cityName,
  snapshot,
  isLoading,
  error,
}: WeatherDisplayProps) {
  if (isLoading) {
    return (
      <section aria-live="polite">
        <h2>{cityName}</h2>
        <p>Loading current weather…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-live="polite">
        <h2>{cityName}</h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  if (!snapshot) {
    return (
      <section aria-live="polite">
        <h2>{cityName}</h2>
        <p>No weather data available.</p>
      </section>
    );
  }

  return (
    <section aria-live="polite">
      <h2>{cityName}</h2>
      <p>{Math.round(snapshot.temperatureF)}°F</p>
      <p>{snapshot.description}</p>
      <p>Humidity: {snapshot.humidityPercent}%</p>
      <p>Wind: {snapshot.windSpeedMph} mph</p>
    </section>
  );
}
