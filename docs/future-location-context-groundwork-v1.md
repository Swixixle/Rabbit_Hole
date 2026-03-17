# Location Context Groundwork v1

Optional, foreground-only location context that can improve recognition and interpretation for certain flows (landmarks, ecology, seasonal concerns, local disambiguation) without changing the core article contract or requiring location globally.

## Status

**Implemented.** Location is accepted in selected recognition flows; backend accepts and validates but does not use location in recognition logic yet.

## Product rule

- Location is **optional** and **contextual**.
- Do **not** request location on app launch.
- Do **not** build background or always-on location.
- Location is requested only when a flow explicitly offers it and the user chooses "Use location".

## Model

```ts
type LocationContext = {
  latitude?: number;
  longitude?: number;
  accuracy?: 'approximate' | 'precise';
}
```

Small and optional; no `regionHint` in v1.

## Permission behavior

- **Mobile:** `expo-location` is used. Permission is requested only when the user taps "Use location" in a flow that supports it.
- If permission is denied, the app continues normally; interpretation proceeds without location.
- If location is available, it is included in the interpretation request payload.
- No background location, no tracking, no persistent storage of location.

## Flows that may request location (v1)

1. **Live Lens** — Before capture, the screen shows: "Location could improve identification." with **Use location** / **Not now**. If the user chooses "Use location", the current position is fetched and sent with the image explore request.
2. **Audio Identify** — Same optional prompt: "Location could improve identification." with **Use location** / **Not now**. If used, location is sent with the audio recognize request.
3. **Page capture** — Not wired in v1; can be added later.

Other entry points (e.g. Home image upload, Share Intake) do **not** request or send location.

## API

Optional `location` is accepted on:

- **POST /v1/explore/image** — body: `{ "uploadId": string, "location"?: LocationContext }`
- **POST /v1/audio/recognize** — body: `{ "clipId"?: string, "uri"?: string, "location"?: LocationContext }`

Backend validates shape and passes through; recognition behavior is unchanged. No landmark/ecology logic yet.

## Example payloads

**Explore image with location:**

```json
{
  "uploadId": "abc-123",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "accuracy": "approximate"
  }
}
```

**Audio recognize with location:**

```json
{
  "clipId": "sample-song",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "accuracy": "precise"
  }
}
```

## Limitations of v1

- Backend **accepts** location but **does not use it** for recognition or disambiguation.
- No landmark, ecology, seasonal, or local-business logic.
- Optional UI is only in Live Lens and Audio Identify.
- No location storage or analytics of location.

## Future path

When recognition logic is extended, location context can support:

- **Landmark recognition** — mountains, parks, overlooks, monuments.
- **Ecological identification** — plants, wildlife, habitats by region.
- **Seasonal / environmental context** — ticks, pollen, poison ivy, local hazards.
- **Local recommendation disambiguation** — businesses, facilities, services by area.

## Setup (mobile)

- **Dependency:** `expo-location` (~17.x) in `apps/mobile`.
- **Permissions:** iOS and Android require location usage descriptions. With Expo, add the `expo-location` plugin in `app.json` if needed; see [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/). In development, simulator/emulator location can be mocked.

## README

See repo README for a short note on optional location context in Identify audio and Live Lens.
