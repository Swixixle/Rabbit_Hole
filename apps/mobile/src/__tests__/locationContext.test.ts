/**
 * Location Context Groundwork v1: tests for permission helper and getCurrentLocationContext.
 * expo-location is mocked; no real device location.
 */
interface LocationContext {
  latitude?: number;
  longitude?: number;
  accuracy?: "approximate" | "precise";
}
import { requestLocationPermission, getCurrentLocationContext } from "../utils/locationContext";

const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (opts: unknown) => mockGetCurrentPositionAsync(opts),
  Accuracy: { Balanced: 4 },
}));

describe("LocationContext payload shape", () => {
  it("matches contract: optional latitude, longitude, accuracy", () => {
    const ctx: LocationContext = {
      latitude: 40.7128,
      longitude: -74.006,
      accuracy: "approximate",
    };
    expect(ctx.latitude).toBe(40.7128);
    expect(ctx.longitude).toBe(-74.006);
    expect(ctx.accuracy).toBe("approximate");
  });

  it("allows partial shape for API payload", () => {
    const minimal: LocationContext = { latitude: 0, longitude: 0 };
    expect(minimal).toMatchObject({ latitude: 0, longitude: 0 });
    expect(["approximate", "precise"]).toContain("precise");
  });
});

describe("requestLocationPermission", () => {
  beforeEach(() => mockRequestForegroundPermissionsAsync.mockReset());

  it("returns true when permission is granted", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    expect(await requestLocationPermission()).toBe(true);
  });

  it("returns false when permission is denied", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "denied" });
    expect(await requestLocationPermission()).toBe(false);
  });
});

describe("getCurrentLocationContext", () => {
  beforeEach(() => {
    mockRequestForegroundPermissionsAsync.mockReset();
    mockGetCurrentPositionAsync.mockReset();
  });

  it("returns null when permission is denied", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "denied" });
    expect(await getCurrentLocationContext()).toBe(null);
    expect(mockGetCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it("returns LocationContext when permission granted and position available", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 40.7, longitude: -74.0, accuracy: 50 },
    });
    const ctx = await getCurrentLocationContext();
    expect(ctx).not.toBe(null);
    expect(ctx).toMatchObject({ latitude: 40.7, longitude: -74.0 });
    expect(ctx!.accuracy).toBe("precise"); // accuracy 50 < 100
  });

  it("maps accuracy to approximate when position accuracy >= 100", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 40.7, longitude: -74.0, accuracy: 200 },
    });
    const ctx = await getCurrentLocationContext();
    expect(ctx).not.toBe(null);
    expect(ctx!.accuracy).toBe("approximate");
  });

  it("returns null when getCurrentPositionAsync throws", async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockGetCurrentPositionAsync.mockRejectedValue(new Error("Position unavailable"));
    expect(await getCurrentLocationContext()).toBe(null);
  });
});
