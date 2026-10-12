# Feature Specification: VA Cities Weather Web App

**Feature Branch**: `001-va-cities-weather`

**Created**: 2026-10-12

**Status**: Draft

**Input**: User description: "A simple web app showing current weather for several VA cities using OpenWeatherMap, built with Next.js (App Router, TypeScript) and a server-side BFF route, following TDD and SOLID, with Spec Kit artifacts committed before implementation."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View current weather for a default VA city (Priority: P1)

A visitor opens the app and immediately sees current weather conditions
(temperature, description, humidity, wind) for a sensible default Virginia
city (Manassas) without having to configure anything.

**Why this priority**: This is the core value of the app — delivering
at-a-glance current weather with zero friction. Without this, there is no
product.

**Independent Test**: Load the app with no interaction; verify the default
city's weather renders from the `/api/weather` BFF route backed by
OpenWeatherMap.

**Acceptance Scenarios**:

1. **Given** the app has just loaded, **When** no city has been explicitly
   selected, **Then** the app displays current weather for Manassas.
2. **Given** the OpenWeatherMap API is reachable, **When** the default city
   loads, **Then** temperature, condition description, humidity, and wind
   speed are all shown.

---

### User Story 2 - Select a different VA city (Priority: P2)

A visitor picks a different Virginia city from a list (e.g., Richmond,
Virginia Beach, Norfolk, Arlington, Alexandria, Charlottesville, Roanoke,
Fairfax, Fredericksburg) and sees that city's current weather update.

**Why this priority**: Comparing weather across VA cities is the
secondary, differentiating value of the app once the default view works.

**Independent Test**: Select each city in the catalog from the
`CitySelector` and verify `WeatherDisplay` updates to that city's data via
a new call to `/api/weather`.

**Acceptance Scenarios**:

1. **Given** the city catalog is rendered, **When** a user selects
   "Richmond", **Then** the weather display updates to Richmond's current
   conditions.
2. **Given** a city is selected, **When** the user selects a different
   city, **Then** the previous city's data is replaced, not appended.

---

### User Story 3 - Resilient handling of provider/network errors (Priority: P3)

A visitor sees a clear, non-technical error message if OpenWeatherMap is
unreachable, rate-limited, or returns bad data — without the API key or raw
provider error payloads ever reaching the browser.

**Why this priority**: Protects the app from looking broken and prevents
leaking credentials/internal details, which is a hard security requirement.

**Independent Test**: Mock the OpenWeatherMap provider to throw/return an
error and verify the `/api/weather` route returns a sanitized error JSON
with an appropriate status code, and the UI shows a friendly message.

**Acceptance Scenarios**:

1. **Given** OpenWeatherMap returns a 5xx or network failure, **When** the
   client requests `/api/weather`, **Then** the route responds with a
   sanitized error (no key, no raw provider body) and the UI shows a
   friendly error state.
2. **Given** a request omits or supplies invalid `lat`/`lon`, **When** the
   client calls `/api/weather`, **Then** the route responds `400` with a
   descriptive validation error.

### Edge Cases

- What happens when `OPENWEATHER_API_KEY` is missing at server startup?
  The route handler must fail safely (500, sanitized message) rather than
  calling the provider with an empty key.
- How does the system handle an unknown/unsupported city id from the
  client? The route must validate against the known city catalog or
  explicit lat/lon bounds and reject with 400 otherwise.
- How does the system handle OpenWeatherMap timeouts? Treated the same as
  other provider errors — sanitized 502/504 response, no leaked internals.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display current weather (temperature, condition
  description, humidity, wind speed) for a selectable Virginia city.
- **FR-002**: System MUST default to Manassas on initial load with no user
  interaction required.
- **FR-003**: System MUST offer the following cities for selection:
  Manassas, Richmond, Virginia Beach, Norfolk, Arlington, Alexandria,
  Charlottesville, Roanoke, Fairfax, Fredericksburg — each with fixed
  latitude/longitude.
- **FR-004**: System MUST fetch weather data server-side via a Next.js
  Route Handler (`/api/weather`) acting as a Backend-for-Frontend (BFF);
  the browser MUST NOT call OpenWeatherMap directly.
- **FR-005**: System MUST read `OPENWEATHER_API_KEY` from server-side
  environment (`.env.local`) only; the key MUST NOT be embedded in any
  client-side bundle, HTML, or response body.
- **FR-006**: The `/api/weather` route MUST validate `lat`/`lon` query
  parameters and respond `400` with a descriptive error when missing or
  invalid.
- **FR-007**: The `/api/weather` route MUST sanitize provider errors —
  never forwarding the raw OpenWeatherMap response body, status text, or
  the API key to the client.
- **FR-008**: System MUST define a `WeatherProvider` interface so the
  concrete `OpenWeatherMapProvider` implementation can be swapped without
  changing the route handler (Dependency Inversion / Open-Closed).
- **FR-009**: System MUST be developed test-first: failing unit/integration
  tests exist for the city catalog, the weather provider/client (including
  mocked HTTP error cases), the `/api/weather` route handler (including the
  400 validation case), `CitySelector`, and `WeatherDisplay`, before their
  implementations are written.
- **FR-010**: Spec Kit artifacts (`spec.md`, `plan.md`, `tasks.md`) MUST be
  committed to `/specs/001-va-cities-weather/` prior to implementation code.

### Key Entities

- **City**: A Virginia city in the catalog — `id`, `name`, `latitude`,
  `longitude`.
- **WeatherSnapshot**: Current conditions returned to the client —
  `cityId`, `temperatureF`, `description`, `humidityPercent`,
  `windSpeedMph`, `observedAt`.
- **WeatherProvider**: Abstraction for fetching a `WeatherSnapshot` given
  coordinates; `OpenWeatherMapProvider` is the concrete implementation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On first load, current weather for Manassas renders without
  any user interaction.
- **SC-002**: Selecting any of the 10 catalog cities updates the displayed
  weather to that city within a single round trip to `/api/weather`.
- **SC-003**: No network request originating from the browser ever
  contains `OPENWEATHER_API_KEY` or a direct call to the
  `api.openweathermap.org` domain (verified via code review / tests of the
  BFF boundary).
- **SC-004**: All required unit/integration tests pass (`npm test`) and
  `npm run build` completes successfully before the feature is considered
  done.
- **SC-005**: Simulated provider failure (mocked network error / 5xx) never
  results in the UI displaying raw provider error text or a stack trace.

## Assumptions

- Users have a modern browser and stable internet connectivity.
- A free OpenWeatherMap API key is available to the developer running the
  app locally (instructions provided in README); the app does not ship
  with a key.
- Only "current weather" (not forecasts/history) is in scope for this
  feature.
- Mobile-specific native apps are out of scope; a responsive web UI is
  sufficient.
- City list and coordinates are static/hardcoded, not user-editable.
