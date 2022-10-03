import { OperatingSystem } from './OperatingSystem';
import { SupportedTask } from './SupportedTask';

export class Software {
  private _supportedTasks: Set<SupportedTask>;
  private _operatingSystem: OperatingSystem;

  constructor(
    supportedTasks: Set<SupportedTask>,
    operatingSystem: OperatingSystem
  ) {
    this._supportedTasks = supportedTasks;
    this._operatingSystem = operatingSystem;
  }

  get supportedTasks(): Set<SupportedTask> {
    return new Set<SupportedTask>(this._supportedTasks);
  }

  get operatingSystem(): OperatingSystem {
    return this._operatingSystem;
  }
}
