import { OperatingSystemName } from './OperatingSystemName';

export class OperatingSystem {
  private _name: OperatingSystemName;
  private _version: string;

  constructor(name: OperatingSystemName, version: string) {
    this._name = name;
    this._version = version;
  }

  get operatingSystemName(): OperatingSystemName {
    return this._name;
  }

  get version(): string {
    return this._version;
  }
}
