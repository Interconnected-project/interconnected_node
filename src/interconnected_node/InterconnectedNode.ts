/* eslint-disable @typescript-eslint/no-explicit-any */
import AnswererP2PConnection from './AnswererP2PConnection';
import BrokerServiceSocket from './broker_service_socket/BrokerServiceSocket';

export class InterconnectedNode {
  private brokerServiceSocket: BrokerServiceSocket;

  constructor(
    private brokerServiceAddress: string,
    private id: string,
    private onIncomingConnectionHandler: (
      payload: any,
      emitIceCandidateCallback: (payload: any) => void,
      disconnectionCallback: () => void
    ) => Promise<AnswererP2PConnection>
  ) {
    this.brokerServiceSocket = new BrokerServiceSocket(
      this.id,
      this.onIncomingConnectionHandler
    );
  }

  start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.brokerServiceSocket.open(this.brokerServiceAddress);
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
    return new Promise<boolean>(() => {
      throw new Error('Not implemented');
    });
  }
}
