/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import AnswererP2PConnection from './AnswererP2PConnection';
import Channels from './Channels';

export default class BrokerServiceSocket {
  private socket: Socket;
  private answererP2PConnections: AnswererP2PConnection[];

  constructor(
    private brokerServiceAddress: string,
    private id: string,
    private logCallback: (msg: string) => void,
    private onIncomingConnectionHandler: (
      payload: any,
      emitIceCandidateCallback: (payload: any) => void,
      disconnectionCallback: () => void
    ) => Promise<AnswererP2PConnection>
  ) {
    this.answererP2PConnections = [];
    this.socket = this.createSocket();
    this.applyHandlersToSocket();
  }

  connect(): void {
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
    while (this.answererP2PConnections.length > 0) {
      this.answererP2PConnections.pop()?.disconnect();
    }
  }

  private createSocket() {
    return io(this.brokerServiceAddress, {
      autoConnect: false,
      query: {
        id: this.id,
        role: 'NODE',
      },
    });
  }

  private emit(channel: string, toId: string, payload: any): void {
    this.logCallback('Emitting ' + channel + ' to ' + toId);
    this.socket.emit(channel, payload);
  }

  private applyOnMessageHandler(
    channel: string,
    handler: (payload: any) => void
  ): void {
    this.socket.on(channel, (payload: any) => {
      this.logCallback('Received ' + channel);
      handler(payload);
    });
  }

  private applyHandlersToSocket(): void {
    this.socket.on('connect', () => {
      this.logCallback('Node connected to Broker!');
    });

    this.socket.on('connect_error', (err) => {
      this.logCallback('Broker connection error: ' + err.message);
    });

    this.applyOnMessageHandler(
      Channels.RECRUITMENT_BROADCAST,
      (payload: any) => {
        payload.answererId = this.id;
        this.emit(Channels.RECRUITMENT_ACCEPT, payload.initiatorId, payload);
      }
    );

    this.applyOnMessageHandler(Channels.INCOMING_CONNECTION, (payload: any) => {
      /*
        calling onIncomingConnectionHandler, provided by the implementor, seving to it
        callbacks that will be used inside the acctual connection implementation
        (these callbacks cannot be moved from here otherwise the "this" reference does not work)
      */
      this.onIncomingConnectionHandler(
        payload,
        (iceCandidatePayload: any) => {
          /* 
            emitIceCandidateCallback implementation served to onIncomingConnectionHandler,
            allowing the implementor to send the Ice Candidate when a new one is generated
          */
          this.emit(
            Channels.ICE_CANDIDATE,
            iceCandidatePayload.toId,
            iceCandidatePayload
          );
        },
        () => {
          /*
            disconnectionCallback implementation served to onIncomingConnectionHandler,
            allowing the implementor to call this whenever the connection is closed
          */
          this.answererP2PConnections = this.answererP2PConnections.filter(
            (conn: AnswererP2PConnection) => {
              return conn.initiatorId !== payload.initiatorId;
            }
          );
        }
      ).then((answererP2PConnection: AnswererP2PConnection) => {
        /*
          after onIncomingConnectionHandler is completed, obtaining the
          AnswererP2PConnection implementation provided by the implementor
        */
        this.answererP2PConnections.push(answererP2PConnection);
        payload.sdp = answererP2PConnection.answer;
        this.emit(Channels.ANSWER_CONNECTION, payload.initiatorId, payload);
      });
    });

    this.applyOnMessageHandler(Channels.ICE_CANDIDATE, (payload: any) => {
      const answererP2P = this.answererP2PConnections.find(
        (conn) => conn.initiatorId === payload.fromId
      );
      if (answererP2P !== undefined && payload.candidate !== undefined) {
        answererP2P.setIceCandidate(payload.candidate);
      }
    });
  }
}
