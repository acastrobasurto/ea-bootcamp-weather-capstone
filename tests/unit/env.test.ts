import { getOpenWeatherApiKey, MissingEnvVarError } from "@/lib/env";

describe("getOpenWeatherApiKey", () => {
  it("returns the API key when OPENWEATHER_API_KEY is set", () => {
    const key = getOpenWeatherApiKey({ OPENWEATHER_API_KEY: "real-key" });
    expect(key).toBe("real-key");
  });

  it("throws a descriptive MissingEnvVarError when the variable is unset", () => {
    expect(() => getOpenWeatherApiKey({})).toThrow(MissingEnvVarError);
    expect(() => getOpenWeatherApiKey({})).toThrow(/OPENWEATHER_API_KEY/);
  });

  it("throws when the variable is set to an empty string", () => {
    expect(() => getOpenWeatherApiKey({ OPENWEATHER_API_KEY: "" })).toThrow(
      MissingEnvVarError
    );
  });
});
