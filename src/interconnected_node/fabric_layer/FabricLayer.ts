import { DeviceInfo } from './device_info/DeviceInfo';
import { Resources } from './resources/Resources';
import { Scheduler } from './scheduler/Scheduler';

export default class FabricLayer {
  private _deviceInfo: DeviceInfo;
  private _scheduler: Scheduler;
  private _resources: Resources;

  constructor(
    deviceInfo: DeviceInfo,
    scheduler: Scheduler,
    resources: Resources
  ) {
    this._deviceInfo = deviceInfo;
    this._scheduler = scheduler;
    this._resources = resources;
  }

  public get deviceInfo(): DeviceInfo {
    return this._deviceInfo;
  }

  public get scheduler(): Scheduler {
    return this._scheduler;
  }

  public get resources(): Resources {
    return this._resources;
  }
}
