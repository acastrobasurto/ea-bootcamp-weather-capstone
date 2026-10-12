# Tasks: VA Cities Weather Web App

**Branch**: `001-va-cities-weather` | **Spec**: `./spec.md` | **Plan**: `./plan.md`

Ordering follows TDD: for every unit, a failing test task precedes its
implementation task. Tasks within a phase are sequential unless marked
`[P]` (can be done in parallel with siblings).

## Phase 0: Project Setup

- [ ] T001 Scaffold Next.js (App Router, TypeScript) project at repo root
- [ ] T002 Add Jest + React Testing Library + next/jest config
      (`jest.config.ts`, `jest.setup.ts`, test script in `package.json`)
- [ ] T003 [P] Add `.env.example` documenting `OPENWEATHER_API_KEY` and
      ensure `.env.local` is gitignored

## Phase 1: City Catalog (US1, US2)

- [ ] T010 Write failing tests `tests/unit/cities.test.ts` — catalog has
      exactly the 10 required cities, Manassas is marked/queryable as
      default, each city has valid lat/lon
- [ ] T011 Implement `src/lib/cities.ts` to pass T010

## Phase 2: Weather Provider (US1, US3)

- [ ] T020 Write failing tests `tests/unit/openweathermap-provider.test.ts`
      — mocked `fetch`: success maps OpenWeatherMap response to
      `WeatherSnapshot` (correct unit conversions); non-2xx response
      throws a typed, sanitized error (no key in error message); network
      failure (rejected fetch) throws a typed error
- [ ] T021 Define `WeatherProvider` interface + `WeatherSnapshot`/`City`
      types in `src/lib/weather-provider.ts`
- [ ] T022 Implement `OpenWeatherMapProvider` in
      `src/lib/openweathermap-provider.ts` to pass T020, reading the API
      key via constructor injection (not `process.env` directly) for
      testability (DIP)

## Phase 3: BFF Route Handler (US1, US2, US3)

- [ ] T030 Write failing tests `tests/integration/weather-route.test.ts`
      for `GET /api/weather`:
      - missing/invalid `lat`/`lon` → 400 with descriptive error
      - provider success → 200 with `WeatherSnapshot` JSON
      - provider throws → sanitized 502 (no key/raw body leaked)
      - missing `OPENWEATHER_API_KEY` env → sanitized 500
- [ ] T031 Implement `app/api/weather/route.ts`: validates query params,
      constructs `OpenWeatherMapProvider` with the server-only env key,
      calls it, maps errors to sanitized responses

## Phase 4: UI Components (US1, US2)

- [ ] T040 [P] Write failing tests `tests/components/CitySelector.test.tsx`
      — renders all 10 cities, calls `onSelect` with the chosen city id,
      shows Manassas as initially selected
- [ ] T041 [P] Implement `src/components/CitySelector.tsx` to pass T040
- [ ] T042 [P] Write failing tests `tests/components/WeatherDisplay.test.tsx`
      — renders temperature/description/humidity/wind given a
      `WeatherSnapshot`; shows loading state; shows a friendly message
      (not raw error) given an error prop
- [ ] T043 [P] Implement `src/components/WeatherDisplay.tsx` to pass T042

## Phase 5: Page Assembly (US1, US2, US3)

- [ ] T050 Wire `app/page.tsx`: defaults to Manassas on mount, fetches
      `/api/weather?lat=&lon=` for the selected city, passes loading/
      data/error state into `WeatherDisplay`, re-fetches on
      `CitySelector` change
- [ ] T051 [P] Add base styling (`app/globals.css`) for a clean, responsive
      layout

## Phase 6: Verification & Documentation

- [ ] T060 Run `npm test` — all tests green
- [ ] T061 Run `npm run build` — build succeeds
- [ ] T062 Run `npm run dev` (or `start`) and smoke-check the running app
      (default city loads, switching cities works, simulated error shows
      friendly message)
- [ ] T063 Write README: setup, obtaining a free OpenWeatherMap API key,
      `.env.local` configuration, run/test/build instructions
- [ ] T064 Commit all work with a descriptive message

## Dependencies

- T001 → T002, T003
- T002 → T010, T020, T030, T040, T042
- T010 → T011
- T020 → T021 → T022
- T011, T022 → T030 → T031
- T040 → T041
- T042 → T043
- T031, T041, T043 → T050 → T051
- T050, T051 → T060 → T061 → T062 → T063 → T064
