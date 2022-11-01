/* eslint-disable @typescript-eslint/no-explicit-any */
import BrokerServiceSocket from './broker_service_socket/BrokerServiceSocket';
import MasterP2PConnection from './masters_hub/MasterP2PConnection';
import MastersHub from './masters_hub/MastersHub';
import SlaveP2PConnection from './slaves_hub/SlaveP2PConnection';

export class InterconnectedNode {
  private brokerServiceSocket: BrokerServiceSocket;

  constructor(
    private id: string,
    private onRecruitmentAcceptHandler: (
      payload: any,
      emitIceCandidateCallback: (payload: any) => void,
      disconnectionCallback: () => void
    ) => Promise<SlaveP2PConnection>,
    private onRequestConnectionHandler: (
      payload: any,
      emitIceCandidateCallback: (payload: any) => void,
      onMasterP2PMessage: (
        msg: any,
        masterP2PConnection: MasterP2PConnection
      ) => void,
      disconnectionCallback: () => void
    ) => Promise<MasterP2PConnection>
  ) {
    this.brokerServiceSocket = new BrokerServiceSocket(
      this.id,
      this.onRecruitmentAcceptHandler,
      this.onRequestConnectionHandler
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
