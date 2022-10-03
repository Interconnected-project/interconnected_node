import { OperatingSystemName } from './OperatingSystemName';

export class OperatingSystem {
  private _name: OperatingSystemName;
  private _version: string;

  constructor(name: OperatingSystemName, version: string) {
    this._name = name;
    this._version = version;
  }

  getOperatingSystemName(): OperatingSystemName {
    return this._name;
  }

  getVersion(): string {
    return this._version;
  }
}
