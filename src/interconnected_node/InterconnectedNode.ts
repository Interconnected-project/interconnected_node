import BrokerServiceSocket from './broker_service_socket/BrokerServiceSocket';
import ClientSpecificP2PConnectionBuilders from './p2p/builders/ClientSpecificP2PConnectionBuilders';

export class InterconnectedNode {
  private brokerServiceSocket: BrokerServiceSocket;

  constructor(
    private interconnectedNodeId: string,
    private builders: ClientSpecificP2PConnectionBuilders
  ) {
    this.brokerServiceSocket = new BrokerServiceSocket(
      this.interconnectedNodeId,
      this.builders
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
        try {
          resolve(this.brokerServiceSocket.isConnected);
        } catch {
          reject();
        }
      }
    });
  }

  isContributing(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (!this.brokerServiceSocket.isOpen) {
        reject();
      } else {
        try {
          resolve(this.brokerServiceSocket.isContributing);
        } catch {
          reject();
        }
      }
    });
  }
}
