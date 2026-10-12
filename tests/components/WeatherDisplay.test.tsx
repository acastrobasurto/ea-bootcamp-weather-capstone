import { render, screen } from "@testing-library/react";
import { WeatherDisplay } from "@/components/WeatherDisplay";

const snapshot = {
  cityId: "manassas",
  temperatureF: 68.5,
  description: "clear sky",
  humidityPercent: 42,
  windSpeedMph: 6.2,
  observedAt: new Date("2026-10-12T12:00:00Z").toISOString(),
};

describe("WeatherDisplay", () => {
  it("renders temperature, description, humidity, and wind when given a snapshot", () => {
    render(<WeatherDisplay cityName="Manassas" snapshot={snapshot} isLoading={false} error={null} />);

    expect(screen.getByText(/manassas/i)).toBeInTheDocument();
    expect(screen.getByText(/69°f|68\.5°f/i)).toBeInTheDocument();
    expect(screen.getByText(/clear sky/i)).toBeInTheDocument();
    expect(screen.getByText(/42%/)).toBeInTheDocument();
    expect(screen.getByText(/6(\.2)? mph/i)).toBeInTheDocument();
  });

  it("shows a loading state while fetching", () => {
    render(<WeatherDisplay cityName="Manassas" snapshot={null} isLoading={true} error={null} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows a friendly error message, never raw error details", () => {
    render(
      <WeatherDisplay
        cityName="Manassas"
        snapshot={null}
        isLoading={false}
        error="Unable to fetch current weather right now. Please try again shortly."
      />
    );
    expect(screen.getByText(/unable to fetch current weather/i)).toBeInTheDocument();
  });
});
