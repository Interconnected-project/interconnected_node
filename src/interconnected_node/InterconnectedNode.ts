/* eslint-disable @typescript-eslint/no-explicit-any */
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
    logCallback: (msg: string) => void,
    onIncomingConnectionHandler: (payload: any) => Promise<any>,
    onIceCandidateReceivedHandler: (payload: any) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.brokerServiceSocket !== undefined) {
        reject();
      } else {
        this.brokerServiceSocket = new BrokerServiceSocket(
          id,
          logCallback,
          onIncomingConnectionHandler,
          onIceCandidateReceivedHandler
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

  emitIceCandidate(payload: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.brokerServiceSocket === undefined) {
        reject();
      } else {
        this.brokerServiceSocket.emit('ICE_CANDIDATE', payload);
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
