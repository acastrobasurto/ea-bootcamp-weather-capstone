/**
 * @jest-environment node
 */
import { createWeatherHandler } from "@/lib/weather-route-handler";
import { WeatherProvider, WeatherProviderError } from "@/lib/weather-provider";

function makeRequest(query: string) {
  return new Request(`http://localhost/api/weather${query}`);
}

describe("weather route handler (BFF)", () => {
  it("returns 400 with a descriptive error when lat/lon are missing", async () => {
    const handler = createWeatherHandler(() => {
      throw new Error("should not be called");
    });

    const response = await handler(makeRequest(""));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/lat/i);
  });

  it("returns 400 with a descriptive error when lat/lon are not valid numbers", async () => {
    const handler = createWeatherHandler(() => {
      throw new Error("should not be called");
    });

    const response = await handler(makeRequest("?lat=abc&lon=-77"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });

  it("returns 200 with the WeatherSnapshot on provider success", async () => {
    const snapshot = {
      cityId: "manassas",
      temperatureF: 70,
      description: "clear sky",
      humidityPercent: 40,
      windSpeedMph: 3,
      observedAt: new Date().toISOString(),
    };
    const provider: WeatherProvider = {
      getCurrentWeather: jest.fn().mockResolvedValue(snapshot),
    };

    const handler = createWeatherHandler(() => provider);
    const response = await handler(makeRequest("?lat=38.75&lon=-77.47"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(snapshot);
  });

  it("returns a sanitized 502 when the provider throws, never leaking provider details", async () => {
    const provider: WeatherProvider = {
      getCurrentWeather: jest
        .fn()
        .mockRejectedValue(new WeatherProviderError("raw upstream detail: key=abc123")),
    };

    const handler = createWeatherHandler(() => provider);
    const response = await handler(makeRequest("?lat=38.75&lon=-77.47"));

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBeDefined();
    expect(JSON.stringify(body)).not.toContain("key=abc123");
  });

  it("returns a sanitized 500 when the provider cannot be constructed (e.g. missing API key)", async () => {
    const handler = createWeatherHandler(() => {
      throw new Error("OPENWEATHER_API_KEY is not set, here is a secret: sk-123");
    });

    const response = await handler(makeRequest("?lat=38.75&lon=-77.47"));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBeDefined();
    expect(JSON.stringify(body)).not.toContain("sk-123");
  });
});
