import { throwIfNotNull } from '../../../common/ErrorHandling';
import { DeviceType } from './hardware/DeviceType';
import { Disk } from './hardware/Disk';
import { Hardware } from './hardware/Hardware';
import { Memory } from './hardware/Memory';
import { Processor } from './hardware/Processor';
import { ConnectionMedium } from './network/ConnectionMedium';
import { Network } from './network/Network';
import { NetworkMetrics } from './network/NetworkMetrics';
import { Resources } from './Resources';
import { OperatingSystem } from './software/OperatingSystem';
import { Software } from './software/Software';
import { SupportedTask } from './software/SupportedTask';

export class ResourcesBuilder {
  private hardware: Hardware | null = null;
  private software: Software | null = null;
  private network: Network | null = null;
  private resources: Resources | null = null;

  setHardware(
    deviceType: DeviceType,
    processor: Processor,
    memory: Memory,
    disk: Disk
  ): ResourcesBuilder {
    throwIfNotNull(this.hardware, 'Hardware is already set');
    this.hardware = new Hardware(deviceType, memory, disk, processor);
    return this;
  }

  setSoftware(
    operatingSystem: OperatingSystem,
    supportedTasks: Set<SupportedTask>
  ): ResourcesBuilder {
    throwIfNotNull(this.software, 'Software is already set');
    this.software = new Software(supportedTasks, operatingSystem);
    return this;
  }

  setNetwork(
    connectionMedium: ConnectionMedium,
    networkMetrics: NetworkMetrics
  ): ResourcesBuilder {
    throwIfNotNull(this.network, 'Network is already set');
    this.network = new Network(connectionMedium, networkMetrics);
    return this;
  }

  build(): Resources {
    throwIfNotNull(
      this.resources,
      'A Resources instance has already been built'
    );
    if (
      this.hardware !== null &&
      this.software !== null &&
      this.network !== null
    ) {
      this.resources = new Resources(
        this.hardware,
        this.software,
        this.network
      );
      return this.resources;
    } else {
      throw new Error('Incorrect build process');
    }
  }
}
