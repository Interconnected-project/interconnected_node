export default interface DeviceInfo {
  getOwnerId(): string;

  getDeviceId(): string;

  getCurrentAddress(): string;

  getCurrentLocation(): string;
}
