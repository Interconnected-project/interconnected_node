import { DeviceInfo } from './fabric_layer/device_info/DeviceInfo';
import FabricLayer from './fabric_layer/FabricLayer';
import { Resources } from './fabric_layer/resources/Resources';
import { Scheduler } from './fabric_layer/scheduler/Scheduler';
import InterconnectedNode from './InterconnectedNode';

export class InterconnectedNodeBuilder {
  private deviceInfo: DeviceInfo | null = null;
  private resources: Resources | null = null;
  private scheduler: Scheduler | null = null;
  private interconnectedNode: InterconnectedNode | null = null;

  setDeviceInfo(
    deviceSpecificImplementation: DeviceInfo
  ): InterconnectedNodeBuilder {
    this.throwIfNotNull(this.deviceInfo, 'DeviceInfo is already set');
    this.deviceInfo = deviceSpecificImplementation;
    return this;
  }

  setResources(
    deviceSpecificImplementation: Resources
  ): InterconnectedNodeBuilder {
    this.throwIfNotNull(this.resources, 'Resources is already set');
    this.resources = deviceSpecificImplementation;
    return this;
  }

  setScheduler(
    deviceSpecificImplementation: Scheduler
  ): InterconnectedNodeBuilder {
    this.throwIfNotNull(this.scheduler, 'Scheduler is already set');
    this.scheduler = deviceSpecificImplementation;
    return this;
  }

  build(): InterconnectedNode {
    this.throwIfNotNull(
      this.interconnectedNode,
      'An InterconnectedNode has already been built'
    );
    if (
      this.deviceInfo !== null &&
      this.scheduler !== null &&
      this.resources !== null
    ) {
      const fabricLayer = new FabricLayer(
        this.deviceInfo,
        this.scheduler,
        this.resources
      );
      return new InterconnectedNode(fabricLayer);
    } else {
      throw new Error('Incorrect build process');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private throwIfNotNull(v: any, message: string) {
    if (v !== null) {
      throw new Error(message);
    }
  }
}
