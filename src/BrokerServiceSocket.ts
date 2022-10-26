/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const wrtc = require('wrtc');

const BROKER_SERVICE_ADDRESS =
  'http://ec2-3-208-18-248.compute-1.amazonaws.com:8000';

export default class BrokerServiceSocket {
  private socket: Socket;
  private peer: Peer.Instance | undefined;

  constructor(
    private id: string,
    private guiPrintCallback: (msg: string) => void,
    private backgroundPrintCallback: (msg: string) => void
  ) {
    this.socket = io(BROKER_SERVICE_ADDRESS, {
      autoConnect: false,
      query: {
        id: id,
        role: 'NODE',
      },
    });
    this.applyHandlers();
    this.peer = undefined;
  }

  connect(): void {
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  private applyHandlers(): void {
    this.socket.on('connect', () => {
      this.guiPrintCallback('Node connected to Broker!');
    });

    this.socket.on('connect_error', (err) => {
      this.guiPrintCallback('Broker connection error: ' + err.message);
    });

    this.socket.on('RECRUITMENT_BROADCAST', (payload: any) => {
      this.guiPrintCallback(
        'Received RECRUITMENT_BROADCAST from ' +
          payload.invokingEndpointId +
          ' for ' +
          payload.initiatorRole +
          ' initiator ' +
          payload.initiatorId
      );
      //TODO check for requirements and blacklist
      payload.answererId = this.id;
      this.socket.emit('RECRUITMENT_ACCEPT', payload);
      this.guiPrintCallback('Node disconnected from Broker');
      this.guiPrintCallback(
        'Sent RECRUITMENT_ACCEPT to ' +
          payload.initiatorRole +
          ' initiator ' +
          payload.initiatorId
      );
    });

    this.socket.on('INCOMING_CONNECTION', (payload: any) => {
      this.guiPrintCallback(
        'Received INCOMING_CONNECTION from ' +
          payload.initiatorRole +
          ' initiator ' +
          payload.initiatorId
      );
      this.peer = new Peer({ initiator: false, trickle: false, wrtc: wrtc });

      this.peer.on('signal', (data) => {
        this.guiPrintCallback(
          'Sending ANSWER_CONNECTION to ' + payload.initiatorId
        );
        payload.signal = data;
        this.socket.emit('ANSWER_CONNECTION', payload);
      });

      this.peer.on('connect', () => {
        this.backgroundPrintCallback(
          'Created P2P connection with ' + payload.initiatorId
        );
      });

      this.peer.on('data', (data) => {
        this.guiPrintCallback(data.toString());
      });

      this.peer.signal(payload.signal);
    });
  }
}
