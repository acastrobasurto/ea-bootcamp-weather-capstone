import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CitySelector } from "@/components/CitySelector";
import { CITIES, DEFAULT_CITY_ID } from "@/lib/cities";

describe("CitySelector", () => {
  it("renders all 10 catalog cities as options", () => {
    render(<CitySelector selectedCityId={DEFAULT_CITY_ID} onSelect={jest.fn()} />);

    const select = screen.getByRole("combobox", { name: /select a virginia city/i });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(CITIES.length);
    expect(select).toHaveValue(DEFAULT_CITY_ID);
  });

  it("shows Manassas as the initially selected city", () => {
    render(<CitySelector selectedCityId={DEFAULT_CITY_ID} onSelect={jest.fn()} />);
    expect(
      screen.getByRole("combobox", { name: /select a virginia city/i })
    ).toHaveValue("manassas");
  });

  it("calls onSelect with the chosen city id when the user picks a different city", async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    render(<CitySelector selectedCityId={DEFAULT_CITY_ID} onSelect={onSelect} />);

    const select = screen.getByRole("combobox", { name: /select a virginia city/i });
    await user.selectOptions(select, "richmond");

    expect(onSelect).toHaveBeenCalledWith("richmond");
  });
});
