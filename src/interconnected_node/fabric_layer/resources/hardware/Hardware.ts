import { DeviceType } from './DeviceType';
import { Disk } from './Disk';
import { Memory } from './Memory';
import { Processor } from './Processor';

export class Hardware {
  private _deviceType: DeviceType;
  private _memory: Memory;
  private _disk: Disk;
  private _processor: Processor;

  constructor(
    deviceType: DeviceType,
    memory: Memory,
    disk: Disk,
    processor: Processor
  ) {
    this._deviceType = deviceType;
    this._memory = memory;
    this._disk = disk;
    this._processor = processor;
  }

  get deviceType(): DeviceType {
    return this._deviceType;
  }

  get memory(): Memory {
    return this._memory;
  }

  get disk(): Disk {
    return this._disk;
  }

  get processor(): Processor {
    return this._processor;
  }
}
