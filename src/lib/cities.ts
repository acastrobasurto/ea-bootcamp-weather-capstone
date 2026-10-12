export interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export const DEFAULT_CITY_ID = "manassas";

export const CITIES: readonly City[] = [
  { id: "manassas", name: "Manassas", latitude: 38.7509, longitude: -77.4753 },
  { id: "richmond", name: "Richmond", latitude: 37.5407, longitude: -77.436 },
  {
    id: "virginia-beach",
    name: "Virginia Beach",
    latitude: 36.8529,
    longitude: -75.978,
  },
  { id: "norfolk", name: "Norfolk", latitude: 36.8508, longitude: -76.2859 },
  { id: "arlington", name: "Arlington", latitude: 38.8816, longitude: -77.0910 },
  {
    id: "alexandria",
    name: "Alexandria",
    latitude: 38.8048,
    longitude: -77.0469,
  },
  {
    id: "charlottesville",
    name: "Charlottesville",
    latitude: 38.0293,
    longitude: -78.4767,
  },
  { id: "roanoke", name: "Roanoke", latitude: 37.2710, longitude: -79.9414 },
  { id: "fairfax", name: "Fairfax", latitude: 38.8462, longitude: -77.3064 },
  {
    id: "fredericksburg",
    name: "Fredericksburg",
    latitude: 38.3032,
    longitude: -77.4605,
  },
];

export function getCityById(id: string): City | undefined {
  return CITIES.find((city) => city.id === id);
}
