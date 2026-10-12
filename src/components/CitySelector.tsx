"use client";

import { CITIES } from "@/lib/cities";

interface CitySelectorProps {
  selectedCityId: string;
  onSelect: (cityId: string) => void;
}

export function CitySelector({ selectedCityId, onSelect }: CitySelectorProps) {
  return (
    <label>
      Select a Virginia city
      <select
        aria-label="Select a Virginia city"
        value={selectedCityId}
        onChange={(event) => onSelect(event.target.value)}
      >
        {CITIES.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
    </label>
  );
}
