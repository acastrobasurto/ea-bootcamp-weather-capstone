import { OpenWeatherMapProvider } from "@/lib/openweathermap-provider";
import { WeatherProviderError } from "@/lib/weather-provider";

const city = { id: "manassas", latitude: 38.7509, longitude: -77.4753 };

describe("OpenWeatherMapProvider", () => {
  const secretApiKey = "super-secret-key-should-never-leak";

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("maps a successful OpenWeatherMap response to a WeatherSnapshot", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        main: { temp: 72.4, humidity: 55 },
        weather: [{ description: "clear sky" }],
        wind: { speed: 5.1 },
        dt: 1_700_000_000,
      }),
    });

    const provider = new OpenWeatherMapProvider(secretApiKey, fetchMock as unknown as typeof fetch);
    const snapshot = await provider.getCurrentWeather(city);

    expect(snapshot).toEqual({
      cityId: "manassas",
      temperatureF: 72.4,
      description: "clear sky",
      humidityPercent: 55,
      windSpeedMph: 5.1,
      observedAt: new Date(1_700_000_000 * 1000).toISOString(),
    });

    // Confirm the request used imperial units and never logged/returned the key.
    const requestedUrl = String(fetchMock.mock.calls[0][0]);
    expect(requestedUrl).toContain("units=imperial");
    expect(requestedUrl).toContain(`appid=${secretApiKey}`);
  });

  it("throws a sanitized WeatherProviderError on a non-2xx response, never leaking the key", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ cod: 401, message: `Invalid API key ${secretApiKey}` }),
    });

    const provider = new OpenWeatherMapProvider(secretApiKey, fetchMock as unknown as typeof fetch);

    await expect(provider.getCurrentWeather(city)).rejects.toThrow(WeatherProviderError);

    try {
      await provider.getCurrentWeather(city);
      fail("expected getCurrentWeather to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WeatherProviderError);
      expect((error as Error).message).not.toContain(secretApiKey);
      expect((error as Error).message).not.toContain("Invalid API key");
    }
  });

  it("throws a sanitized WeatherProviderError when the network request fails", async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error(`ECONNREFUSED ${secretApiKey}`));
    const provider = new OpenWeatherMapProvider(secretApiKey, fetchMock as unknown as typeof fetch);

    await expect(provider.getCurrentWeather(city)).rejects.toThrow(WeatherProviderError);

    try {
      await provider.getCurrentWeather(city);
      fail("expected getCurrentWeather to throw");
    } catch (error) {
      expect((error as Error).message).not.toContain(secretApiKey);
    }
  });
});
