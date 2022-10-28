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
      emitIceCandidateCallback: (payload: any) => void
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
    //TODO remove all p2p connections
    this.socket.disconnect();
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

  private logReceivedMessage(channel: string, fromId: string): void {
    this.logCallback('Received ' + channel + ' from ' + fromId);
  }

  private applyHandlersToSocket(): void {
    this.socket.on('connect', () => {
      this.logCallback('Node connected to Broker!');
    });

    this.socket.on('connect_error', (err) => {
      this.logCallback('Broker connection error: ' + err.message);
    });

    this.socket.on(Channels.RECRUITMENT_BROADCAST, (payload: any) => {
      this.logReceivedMessage(
        Channels.RECRUITMENT_BROADCAST,
        payload.invokingEndpointId
      );
      //TODO check for requirements
      payload.answererId = this.id;
      this.emit(Channels.RECRUITMENT_ACCEPT, payload.initiatorId, payload);
    });

    this.socket.on(Channels.INCOMING_CONNECTION, (payload: any) => {
      this.logReceivedMessage(
        Channels.INCOMING_CONNECTION,
        payload.initiatorId
      );
      this.onIncomingConnectionHandler(payload, (iceCandidatePayload: any) => {
        this.emit(
          Channels.ICE_CANDIDATE,
          iceCandidatePayload.toId,
          iceCandidatePayload
        );
      }).then((answererP2PConnection: AnswererP2PConnection) => {
        this.answererP2PConnections.push(answererP2PConnection);
        payload.sdp = answererP2PConnection.answer;
        this.emit(Channels.ANSWER_CONNECTION, payload.initiatorId, payload);
      });
    });

    this.socket.on(Channels.ICE_CANDIDATE, (payload: any) => {
      this.logReceivedMessage(Channels.ICE_CANDIDATE, payload.fromId);
      const answererP2P = this.answererP2PConnections.find(
        (conn) => conn.initiatorId === payload.fromId
      );
      if (answererP2P !== undefined && payload.candidate !== undefined) {
        answererP2P.setIceCandidate(payload.candidate);
      }
    });
  }
}
