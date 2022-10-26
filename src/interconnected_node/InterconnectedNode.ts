import BrokerServiceSocket from '../BrokerServiceSocket';

// import ConnectivityLayer from './connectivity_layer/ConnectivityLayer';
// import FabricLayer from './fabric_layer/FabricLayer';
// import ResourceLayer from './resource_layer/ResourceLayer';

export default class InterconnectedNode {
  //private connectivityLayer: ConnectivityLayer;
  //private resourceLayer: ResourceLayer;
  private brokerServiceSocket: BrokerServiceSocket | undefined;

  constructor(/*private fabricLayer: FabricLayer*/) {
    //this.connectivityLayer = new ConnectivityLayer(fabricLayer);
    //this.resourceLayer = new ResourceLayer(fabricLayer, this.connectivityLayer);
    this.brokerServiceSocket = undefined;
  }

  start(
    id: string,
    guiPrintCallback: (msg: string) => void,
    backgroundPrintCallback: (msg: string) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.brokerServiceSocket !== undefined) {
        reject();
      } else {
        this.brokerServiceSocket = new BrokerServiceSocket(
          id,
          guiPrintCallback,
          backgroundPrintCallback
        );
        this.brokerServiceSocket.connect();
        resolve();
      }
    });
  }

  stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.brokerServiceSocket === undefined) {
        reject();
      } else {
        this.brokerServiceSocket.disconnect();
        this.brokerServiceSocket = undefined;
        resolve();
      }
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
