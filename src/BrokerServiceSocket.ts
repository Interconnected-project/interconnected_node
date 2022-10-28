/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import AnswererP2PConnection from './AnswererP2PConnection';

const BROKER_SERVICE_ADDRESS =
  'http://ec2-3-208-18-248.compute-1.amazonaws.com:8000';

export default class BrokerServiceSocket {
  private socket: Socket;
  private answererP2PConnections: AnswererP2PConnection[] = [];

  constructor(
    private id: string,
    private logCallback: (msg: string) => void,
    private onIncomingConnectionHandler: (
      payload: any,
      emitIceCandidate: (payload: any) => void
    ) => Promise<AnswererP2PConnection>
  ) {
    this.socket = io(BROKER_SERVICE_ADDRESS, {
      autoConnect: false,
      query: {
        id: id,
        role: 'NODE',
      },
    });
    this.applyHandlers();
  }

  connect(): void {
    this.socket.connect();
  }

  disconnect(): void {
    //TODO remove all p2p connections
    this.socket.disconnect();
  }

  private emit(channel: string, payload: any): void {
    this.socket.emit(channel, payload);
  }

  private applyHandlers(): void {
    this.socket.on('connect', () => {
      this.logCallback('Node connected to Broker!');
    });

    this.socket.on('connect_error', (err) => {
      this.logCallback('Broker connection error: ' + err.message);
    });

    this.socket.on('RECRUITMENT_BROADCAST', (payload: any) => {
      this.logCallback(
        'Received RECRUITMENT_BROADCAST from ' +
          payload.invokingEndpointId +
          ' for ' +
          payload.initiatorRole +
          ' initiator ' +
          payload.initiatorId
      );
      //TODO check for requirements
      payload.answererId = this.id;
      this.emit('RECRUITMENT_ACCEPT', payload);
      this.logCallback(
        'Sent RECRUITMENT_ACCEPT to ' +
          payload.initiatorRole +
          ' initiator ' +
          payload.initiatorId
      );
    });

    this.socket.on('INCOMING_CONNECTION', (payload: any) => {
      this.logCallback(
        'Received INCOMING_CONNECTION from ' +
          payload.initiatorRole +
          ' initiator ' +
          payload.initiatorId
      );
      this.onIncomingConnectionHandler(payload, (iceCandidatePayload: any) => {
        this.logCallback(
          'Emitting ICE_CANDIDATE to ' + iceCandidatePayload.toId
        );
        this.emit('ICE_CANDIDATE', iceCandidatePayload);
      }).then((answererP2PConnection: AnswererP2PConnection) => {
        this.answererP2PConnections.push(answererP2PConnection);
        payload.sdp = answererP2PConnection.answer;
        this.emit('ANSWER_CONNECTION', payload);
      });
    });

    this.socket.on('ICE_CANDIDATE', (payload: any) => {
      this.logCallback(
        'Received ICE_CANDIDATE from ' +
          payload.senderRole +
          ' ' +
          payload.fromId
      );
      const answererP2P = this.answererP2PConnections.find(
        (conn) => conn.initiatorId === payload.fromId
      );
      if (answererP2P !== undefined && payload.candidate !== undefined) {
        answererP2P.setIceCandidate(payload.candidate);
      }
    });
  }
}
