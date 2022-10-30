/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import MasterP2PConnection from '../masters_hub/MasterP2PConnection';
import MastersHub from '../masters_hub/MastersHub';
import applyBrokerServiceHandlers from './applyBrokerServiceHandlers';

export default class BrokerServiceSocket {
  private socket: Socket | undefined;

  constructor(
    private id: string,
    private onRequestConnectionHandler: (
      payload: any,
      emitIceCandidateCallback: (payload: any) => void,
      disconnectionCallback: () => void
    ) => Promise<MasterP2PConnection>
  ) {
    this.socket = undefined;
  }

  open(brokerServiceAddress: string): void {
    if (this.socket !== undefined) {
      throw new Error('BrokerServiceSocket already opened');
    }
    this.socket = io(brokerServiceAddress, {
      autoConnect: false,
      query: {
        id: this.id,
        role: 'NODE',
      },
    });
    this.socket.connect();
    applyBrokerServiceHandlers(
      this.socket,
      this.id,
      this.onRequestConnectionHandler
    );
  }

  close(): void {
    if (this.socket === undefined) {
      throw new Error('BrokerServiceSocket is not open');
    }
    this.socket.disconnect();
    const masters = MastersHub.flush();
    masters.forEach((m) => m.disconnect());
    this.socket = undefined;
  }

  get isOpen(): boolean {
    return this.socket !== undefined;
  }

  get isConnected(): boolean {
    if (this.socket === undefined) {
      throw new Error('BrokerServiceSocket is not open');
    }
    return this.socket.connected;
  }
}
