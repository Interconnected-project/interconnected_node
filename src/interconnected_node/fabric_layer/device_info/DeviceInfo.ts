export interface DeviceInfo {
  getOwnerId(): string;

  getDeviceId(): string;

  getCurrentLocation(): string;
}
