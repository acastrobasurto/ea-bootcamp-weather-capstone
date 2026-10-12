"use client";

import { useEffect, useState } from "react";
import { CitySelector } from "@/components/CitySelector";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { CITIES, DEFAULT_CITY_ID, getCityById } from "@/lib/cities";
import type { WeatherSnapshot } from "@/lib/weather-provider";

export default function Home() {
  const [selectedCityId, setSelectedCityId] = useState(DEFAULT_CITY_ID);
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedCity = getCityById(selectedCityId) ?? CITIES[0];

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          lat: String(selectedCity.latitude),
          lon: String(selectedCity.longitude),
          cityId: selectedCity.id,
        });
        const response = await fetch(`/api/weather?${params.toString()}`);
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body.error ?? "Unable to fetch current weather.");
        }

        if (!cancelled) {
          setSnapshot(body as WeatherSnapshot);
        }
      } catch (err) {
        if (!cancelled) {
          setSnapshot(null);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to fetch current weather right now. Please try again shortly."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [selectedCity.id, selectedCity.latitude, selectedCity.longitude]);

  return (
    <main className="page">
      <h1>Virginia Cities Weather</h1>
      <CitySelector selectedCityId={selectedCityId} onSelect={setSelectedCityId} />
      <WeatherDisplay
        cityName={selectedCity.name}
        snapshot={snapshot}
        isLoading={isLoading}
        error={error}
      />
    </main>
  );
}
