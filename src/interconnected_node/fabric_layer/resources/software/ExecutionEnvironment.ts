import { ExecutionPlatform } from './ExecutionPlatform';

export class ExecutionEnvironment {
  private _executionPlatform: ExecutionPlatform;
  private _supportedVersions: Set<string>;

  constructor(
    executionPlatform: ExecutionPlatform,
    supportedVersion: Set<string>
  ) {
    this._executionPlatform = executionPlatform;
    this._supportedVersions = supportedVersion;
  }

  getExecutionPlatform(): ExecutionPlatform {
    return this._executionPlatform;
  }

  getSupportedVersions(): Set<string> {
    return this.deepCopySupportedVersions(this._supportedVersions);
  }

  private deepCopySupportedVersions(
    supportedVersions: Set<string>
  ): Set<string> {
    return new Set<string>(JSON.stringify([...supportedVersions]));
  }
}
