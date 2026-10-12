import { WeatherProvider, WeatherProviderError } from "./weather-provider";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/**
 * Builds the GET handler for the /api/weather BFF route. The provider is
 * supplied via a factory function (rather than a pre-built instance) so
 * that provider-construction failures (e.g. a missing API key) are caught
 * and sanitized the same way as provider-call failures - and so tests can
 * inject a fake WeatherProvider without touching real env vars or network.
 */
export function createWeatherHandler(
  getProvider: () => WeatherProvider
): (request: Request) => Promise<Response> {
  return async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");

    if (!latParam || !lonParam) {
      return jsonResponse(400, {
        error: "Both 'lat' and 'lon' query parameters are required.",
      });
    }

    const latitude = Number(latParam);
    const longitude = Number(lonParam);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return jsonResponse(400, {
        error: "'lat' and 'lon' must be valid numeric coordinates.",
      });
    }

    let provider: WeatherProvider;
    try {
      provider = getProvider();
    } catch {
      return jsonResponse(500, {
        error: "The weather service is not configured correctly.",
      });
    }

    try {
      const snapshot = await provider.getCurrentWeather({
        id: searchParams.get("cityId") ?? "unknown",
        latitude,
        longitude,
      });
      return jsonResponse(200, snapshot);
    } catch (error) {
      if (error instanceof WeatherProviderError) {
        return jsonResponse(502, {
          error: "Unable to fetch current weather right now. Please try again shortly.",
        });
      }
      return jsonResponse(502, {
        error: "An unexpected error occurred while fetching weather data.",
      });
    }
  };
}
