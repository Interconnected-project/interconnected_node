import ConnectivityLayer from './connectivity_layer/ConnectivityLayer';
import FabricLayer from './fabric_layer/FabricLayer';
import ResourceLayer from './resource_layer/ResourceLayer';

export default class InterconnectedNode {
  private connectivityLayer: ConnectivityLayer;
  private resourceLayer: ResourceLayer;

  constructor(private fabricLayer: FabricLayer) {
    this.connectivityLayer = new ConnectivityLayer(fabricLayer);
    this.resourceLayer = new ResourceLayer(fabricLayer, this.connectivityLayer);
  }

  start(userId: string, userPassword: string): Promise<void> {
    return new Promise<void>(() => {
      throw new Error('Not implemented');
    });
  }

  stop(): Promise<void> {
    return new Promise<void>(() => {
      throw new Error('Not implemented');
    });
  }

  isRunning(): Promise<boolean> {
    return new Promise<boolean>(() => {
      throw new Error('Not implemented');
    });
  }

  isConnectedToGrid(): Promise<boolean> {
    return new Promise<boolean>(() => {
      throw new Error('Not implemented');
    });
  }

  isExecutingTasks(): Promise<boolean> {
    return new Promise<boolean>(() => {
      throw new Error('Not implemented');
    });
  }
}
