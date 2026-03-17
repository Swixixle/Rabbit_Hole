/**
 * Location Context Groundwork v1: optional, foreground-only location for recognition flows.
 * Only request when a flow explicitly asks (e.g. "Use location"); never on app launch or in background.
 */
import * as Location from "expo-location";
import type { LocationContext } from "@rabbit-hole/contracts";

/**
 * Request foreground location permission. Returns true if granted, false if denied.
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

/**
 * Get current location context. Requests permission if not yet determined.
 * Returns null if permission denied or location unavailable. Prefer approximate accuracy when sufficient.
 */
export async function getCurrentLocationContext(): Promise<LocationContext | null> {
  const granted = await requestLocationPermission();
  if (!granted) return null;
  try {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = position.coords;
    const accuracy: "approximate" | "precise" =
      position.coords.accuracy != null && position.coords.accuracy < 100 ? "precise" : "approximate";
    return { latitude, longitude, accuracy };
  } catch {
    return null;
  }
}
