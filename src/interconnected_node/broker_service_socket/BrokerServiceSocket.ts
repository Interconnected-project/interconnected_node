/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import MasterP2PConnection from '../masters_hub/MasterP2PConnection';
import MastersHub from '../masters_hub/MastersHub';
import BrokerServiceChannels from './BrokerServiceChannels';

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
    this.applyHandlersToSocket(this.socket);
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

  private emit(channel: string, toId: string, payload: any): void {
    if (this.socket !== undefined) {
      console.log('Emitting ' + channel + ' to ' + toId);
      this.socket.emit(channel, payload);
    }
  }

  private applyOnMessageHandler(
    socket: Socket,
    channel: string,
    handler: (payload: any) => void
  ): void {
    socket.on(channel, (payload: any) => {
      console.log('Received ' + channel);
      handler(payload);
    });
  }

  private applyHandlersToSocket(socket: Socket): void {
    socket.on('connect', () => {
      console.log('Node connected to Broker!');
    });

    socket.on('connect_error', (err) => {
      console.log('Broker connection error: ' + err.message);
    });

    this.applyOnMessageHandler(
      socket,
      BrokerServiceChannels.RECRUITMENT_BROADCAST,
      (payload: any) => {
        payload.answererId = this.id;
        this.emit(
          BrokerServiceChannels.RECRUITMENT_ACCEPT,
          payload.initiatorId,
          payload
        );
      }
    );

    this.applyOnMessageHandler(
      socket,
      BrokerServiceChannels.REQUEST_CONNECTION,
      (payload: any) => {
        /*
        calling onRequestConnectionHandler, provided by the implementor, seving to it
        callbacks that will be used inside the acctual connection implementation
        (these callbacks cannot be moved from here otherwise the "this" reference does not work)
      */
        this.onRequestConnectionHandler(
          payload,
          (iceCandidatePayload: any) => {
            /* 
            emitIceCandidateCallback implementation served to onIncomingConnectionHandler,
            allowing the implementor to send the Ice Candidate when a new one is generated
          */
            this.emit(
              BrokerServiceChannels.ICE_CANDIDATE,
              iceCandidatePayload.toId,
              iceCandidatePayload
            );
          },
          () => {
            /*
            disconnectionCallback implementation served to onIncomingConnectionHandler,
            allowing the implementor to call this whenever the connection is closed
          */
            MastersHub.remove(payload.initiatorId);
          }
        ).then((masterP2PConnection: MasterP2PConnection) => {
          /*
          after onIncomingConnectionHandler is completed, obtaining the
          MasterP2PConnection implementation provided by the implementor
        */
          MastersHub.add(masterP2PConnection);
          payload.sdp = masterP2PConnection.answer;
          this.emit(
            BrokerServiceChannels.ANSWER_CONNECTION,
            payload.initiatorId,
            payload
          );
        });
      }
    );

    this.applyOnMessageHandler(
      socket,
      BrokerServiceChannels.ICE_CANDIDATE,
      (payload: any) => {
        const masterP2P = MastersHub.getByMasterId(payload.fromId);
        if (masterP2P !== undefined && payload.candidate !== undefined) {
          masterP2P.setIceCandidate(payload.candidate);
        }
      }
    );
  }
}
