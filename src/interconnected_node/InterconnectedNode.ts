/* eslint-disable @typescript-eslint/no-explicit-any */
import BrokerServiceSocket from './broker_service_socket/BrokerServiceSocket';
import MasterP2PConnection from './masters_hub/MasterP2PConnection';
import MastersHub from './masters_hub/MastersHub';

export class InterconnectedNode {
  private brokerServiceSocket: BrokerServiceSocket;

  constructor(
    private id: string,
    private onIncomingConnectionHandler: (
      payload: any,
      emitIceCandidateCallback: (payload: any) => void,
      disconnectionCallback: () => void
    ) => Promise<MasterP2PConnection>
  ) {
    this.brokerServiceSocket = new BrokerServiceSocket(
      this.id,
      this.onIncomingConnectionHandler
    );
  }

  start(brokerServiceAddress: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.brokerServiceSocket.open(brokerServiceAddress);
        resolve();
      } catch {
        reject();
      }
    });
  }

  stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.brokerServiceSocket.close();
        resolve();
      } catch {
        reject();
      }
    });
  }

  isRunning(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      resolve(this.brokerServiceSocket.isOpen);
    });
  }

  isConnectedToGrid(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.brokerServiceSocket.isOpen) {
        reject();
      } else {
        resolve(this.brokerServiceSocket.isConnected);
      }
    });
  }

  isContributing(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.brokerServiceSocket.isOpen) {
        reject();
      } else {
        // TODO check also slaves
        resolve(!MastersHub.isEmpty);
      }
    });
  }
}
