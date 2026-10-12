# Implementation Plan: VA Cities Weather Web App

**Branch**: `001-va-cities-weather` | **Date**: 2026-10-12 | **Spec**: `./spec.md`

**Input**: Feature specification from `/specs/001-va-cities-weather/spec.md`

## Summary

Build a Next.js (App Router, TypeScript) app that shows current weather for
10 Virginia cities (default: Manassas). The browser never talks to
OpenWeatherMap directly — a server-side Route Handler (`app/api/weather/route.ts`)
acts as a BFF, injecting the `OPENWEATHER_API_KEY` server-side and returning
sanitized JSON. Core logic (city catalog, provider interface, provider
implementation, route handler, UI components) is built test-first (Jest +
React Testing Library), following SOLID: a `WeatherProvider` interface is
injected into the route handler so the OpenWeatherMap implementation can be
swapped (DIP/OCP), and each module has a single responsibility (SRP).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+

**Primary Dependencies**: Next.js 14+ (App Router), React 18, Jest,
@testing-library/react, @testing-library/jest-dom, ts-jest (or Next's
built-in SWC Jest transform)

**Storage**: N/A (no persistence; stateless requests to OpenWeatherMap)

**Testing**: Jest + React Testing Library (unit + component + route handler
integration tests)

**Target Platform**: Web (server-rendered/hybrid Next.js app, runs locally
via `npm run dev` / `npm run build && npm start`)

**Project Type**: Web application (single Next.js project combining
frontend + BFF backend via Route Handlers)

**Performance Goals**: Weather for a selected city renders within a single
round trip to `/api/weather` (typically < 1s excluding provider latency)

**Constraints**: `OPENWEATHER_API_KEY` must never reach the client bundle,
HTML, or any client-visible response; provider errors must be sanitized

**Scale/Scope**: 10 fixed VA cities, single feature, no auth, no database

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Test-first development (TDD) is mandatory per project constitution —
  satisfied by writing failing tests for every unit before implementation.
- SOLID structure required — satisfied via `WeatherProvider` interface +
  `OpenWeatherMapProvider` implementation, one responsibility per module.
- Secrets must never leak to the client — satisfied by the BFF boundary
  design (server-only route handler reads `process.env.OPENWEATHER_API_KEY`).
- No gates are blocked; proceeding to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-va-cities-weather/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Task breakdown (TDD-ordered)
```

### Source Code (repository root)

```text
app/
├── page.tsx                      # Home page: renders CitySelector + WeatherDisplay
├── layout.tsx                    # Root layout
├── globals.css                   # Base styling
└── api/
    └── weather/
        └── route.ts              # BFF Route Handler: GET /api/weather?lat=&lon=

src/
├── lib/
│   ├── cities.ts                 # City catalog (id, name, lat, lon)
│   ├── weather-provider.ts       # WeatherProvider interface + WeatherSnapshot type
│   └── openweathermap-provider.ts # OpenWeatherMapProvider implementation
└── components/
    ├── CitySelector.tsx          # City dropdown/list component
    └── WeatherDisplay.tsx        # Renders a WeatherSnapshot or error/loading state

tests/
├── unit/
│   ├── cities.test.ts
│   ├── openweathermap-provider.test.ts
├── integration/
│   └── weather-route.test.ts     # Tests app/api/weather/route.ts
└── components/
    ├── CitySelector.test.tsx
    └── WeatherDisplay.test.tsx

.env.example                      # Documents OPENWEATHER_API_KEY (no real value)
jest.config.ts
jest.setup.ts
```

**Structure Decision**: Single Next.js project (Option: web application with
integrated backend) — the App Router's Route Handlers serve as the BFF, so
there is no separate backend service/repo. `src/lib` holds framework-agnostic
logic (easiest to unit test in isolation); `src/components` holds UI;
`app/` holds Next.js routing/pages that wire them together.

## Phase 0: Research

- OpenWeatherMap "Current Weather Data" endpoint:
  `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=imperial`
  returns `main.temp`, `main.humidity`, `weather[0].description`,
  `wind.speed`. Confirmed free tier supports this endpoint with an API key
  from https://openweathermap.org/current (sign up → API keys tab).
- Next.js Route Handlers (`app/api/.../route.ts`) run server-side only;
  `process.env.OPENWEATHER_API_KEY` without `NEXT_PUBLIC_` prefix is never
  exposed to the client bundle — this satisfies the secrecy requirement.
- Jest + Next.js: use `next/jest` preset for zero-config SWC-based
  transform supporting TS + JSX, paired with `@testing-library/react` for
  component tests and `node-mocks-http` or direct `Request`/`Response`
  construction for route handler tests (Next 14 route handlers are plain
  async functions taking a `Request`).

## Phase 1: Design

- **Entities**: `City { id, name, latitude, longitude }`,
  `WeatherSnapshot { cityId, temperatureF, description, humidityPercent,
  windSpeedMph, observedAt }`.
- **Contracts**:
  - `WeatherProvider.getCurrentWeather(lat: number, lon: number): Promise<WeatherSnapshot>`
    — interface implemented by `OpenWeatherMapProvider`.
  - `GET /api/weather?lat=<number>&lon=<number>` → `200 WeatherSnapshot` |
    `400 { error }` (invalid/missing params) | `502 { error }` (provider
    failure) | `500 { error }` (missing server config) — all sanitized,
    never including the API key or raw provider body.
- **Quickstart**: see README — copy `.env.example` to `.env.local`, add a
  free OpenWeatherMap key, `npm install`, `npm test`, `npm run dev`.

## Phase 2: Tasks

See `tasks.md` for the ordered, dependency-aware task breakdown (tests
before implementation for every unit).
