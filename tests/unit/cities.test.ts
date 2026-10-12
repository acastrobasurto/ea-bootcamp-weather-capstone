import { CITIES, DEFAULT_CITY_ID, getCityById } from "@/lib/cities";

describe("cities catalog", () => {
  const expectedCityNames = [
    "Manassas",
    "Richmond",
    "Virginia Beach",
    "Norfolk",
    "Arlington",
    "Alexandria",
    "Charlottesville",
    "Roanoke",
    "Fairfax",
    "Fredericksburg",
  ];

  it("contains exactly the 10 required Virginia cities", () => {
    expect(CITIES).toHaveLength(10);
    expect(CITIES.map((city) => city.name).sort()).toEqual(
      [...expectedCityNames].sort()
    );
  });

  it("gives every city a unique id and valid Virginia-ish coordinates", () => {
    const ids = CITIES.map((city) => city.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const city of CITIES) {
      expect(city.latitude).toBeGreaterThan(35);
      expect(city.latitude).toBeLessThan(40.5);
      expect(city.longitude).toBeGreaterThan(-84);
      expect(city.longitude).toBeLessThan(-75);
    }
  });

  it("defaults to Manassas", () => {
    const defaultCity = getCityById(DEFAULT_CITY_ID);
    expect(defaultCity?.name).toBe("Manassas");
  });

  it("getCityById returns undefined for an unknown id", () => {
    expect(getCityById("not-a-real-city")).toBeUndefined();
  });
});
