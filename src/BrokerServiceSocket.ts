/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';

const BROKER_SERVICE_ADDRESS =
  'http://ec2-3-208-18-248.compute-1.amazonaws.com:8000';

export default class BrokerServiceSocket {
  private socket: Socket;

  constructor(
    private id: string,
    private logCallback: (msg: string) => void,
    private onIncomingConnectionHandler: (payload: any) => Promise<any>,
    private onIceCandidateReceivedHandler: (payload: any) => void
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
    this.socket.disconnect();
  }

  emit(channel: string, payload: any): void {
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
      //TODO check for requirements and blacklist
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
      this.onIncomingConnectionHandler(payload).then((newPayload) => {
        this.emit('ANSWER_CONNECTION', newPayload);
      });
    });

    this.socket.on('ICE_CANDIDATE', (payload: any) => {
      this.logCallback(
        'Received ICE_CANDIDATE from ' +
          payload.senderRole +
          ' ' +
          payload.fromId
      );
      this.onIceCandidateReceivedHandler(payload);
    });
  }
}
