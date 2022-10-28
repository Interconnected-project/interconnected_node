/* eslint-disable @typescript-eslint/no-explicit-any */
import AnswererP2PConnection from '../AnswererP2PConnection';
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
    brokerServiceAddress: string,
    id: string,
    logCallback: (msg: string) => void,
    onIncomingConnectionHandler: (
      payload: any,
      emitIceCandidateCallback: (payload: any) => void,
      disconnectionCallback: () => void
    ) => Promise<AnswererP2PConnection>
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.brokerServiceSocket !== undefined) {
        reject();
      } else {
        this.brokerServiceSocket = new BrokerServiceSocket(
          brokerServiceAddress,
          id,
          logCallback,
          onIncomingConnectionHandler
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
