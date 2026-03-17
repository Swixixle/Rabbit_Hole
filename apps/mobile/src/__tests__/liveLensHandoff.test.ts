/**
 * Live Camera Recognition Groundwork v1: tests for capture-and-upload handoff and fallbacks.
 */
import * as ImagePicker from "expo-image-picker";
import {
  requestCameraPermission,
  captureFrame,
  captureAndUploadFrame,
} from "../utils/liveLensHandoff";

jest.mock("expo-image-picker", () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: "Images" },
  PermissionStatus: { GRANTED: "granted", DENIED: "denied" },
}));

const mockRequestCameraPermissionsAsync = ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const mockLaunchCameraAsync = ImagePicker.launchCameraAsync as jest.Mock;

describe("requestCameraPermission", () => {
  it("returns true when permission is granted", async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({
      status: "granted",
    });
    expect(await requestCameraPermission()).toBe(true);
  });

  it("returns false when permission is denied", async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({
      status: "denied",
    });
    expect(await requestCameraPermission()).toBe(false);
  });
});

describe("captureFrame", () => {
  it("returns uri when user takes a photo", async () => {
    mockLaunchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///photo.jpg" }],
    });
    expect(await captureFrame()).toBe("file:///photo.jpg");
  });

  it("returns null when user cancels", async () => {
    mockLaunchCameraAsync.mockResolvedValue({ canceled: true });
    expect(await captureFrame()).toBe(null);
  });

  it("returns null when no assets", async () => {
    mockLaunchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [],
    });
    expect(await captureFrame()).toBe(null);
  });
});

describe("captureAndUploadFrame", () => {
  const uploadImage = jest.fn();

  beforeEach(() => {
    uploadImage.mockReset();
  });

  it("returns error when camera permission is denied", async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({ status: "denied" });
    const result = await captureAndUploadFrame(uploadImage);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Camera");
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("returns error when user cancels capture", async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockLaunchCameraAsync.mockResolvedValue({ canceled: true });
    const result = await captureAndUploadFrame(uploadImage);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("No photo");
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("returns uploadId and imageUri when capture and upload succeed", async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockLaunchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///capture.jpg" }],
    });
    uploadImage.mockResolvedValue({ uploadId: "up-123" });
    const result = await captureAndUploadFrame(uploadImage);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.uploadId).toBe("up-123");
      expect(result.imageUri).toBe("file:///capture.jpg");
    }
    expect(uploadImage).toHaveBeenCalledWith("file:///capture.jpg");
  });

  it("returns error when upload fails", async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockLaunchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///capture.jpg" }],
    });
    uploadImage.mockRejectedValue(new Error("Network error"));
    const result = await captureAndUploadFrame(uploadImage);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("Network error");
  });
});

describe("live-lens handoff routing", () => {
  it("success result shape is suitable for onImageReady(uploadId, imageUri)", async () => {
    mockRequestCameraPermissionsAsync.mockResolvedValue({ status: "granted" });
    mockLaunchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///frame.jpg" }],
    });
    const uploadImage = jest.fn().mockResolvedValue({ uploadId: "upload-1" });
    const result = await captureAndUploadFrame(uploadImage);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(typeof result.uploadId).toBe("string");
      expect(typeof result.imageUri).toBe("string");
      expect(result.uploadId.length).toBeGreaterThan(0);
      expect(result.imageUri.length).toBeGreaterThan(0);
    }
  });
});
