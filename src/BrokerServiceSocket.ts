import { io, Socket } from 'socket.io-client';

const BROKER_SERVICE_ADDRESS =
  'http://ec2-3-208-18-248.compute-1.amazonaws.com:8000';

export default class BrokerServiceSocket {
  private socket: Socket;

  constructor(
    id: string,
    guiPrintCallback: (msg: string) => void,
    backgroundPrintCallback: (msg: string) => void
  ) {
    this.socket = io(BROKER_SERVICE_ADDRESS, {
      autoConnect: false,
      query: {
        id: id,
        role: 'NODE',
      },
    });
    applyHandlers(this.socket, guiPrintCallback, backgroundPrintCallback);
  }

  connect(): void {
    this.socket.connect();
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}

function applyHandlers(
  socket: Socket,
  guiPrintCallback: (msg: string) => void,
  backgroundPrintCallback: (msg: string) => void
): void {
  socket.on('connect', function () {
    guiPrintCallback('Node connected to Broker!');
  });

  socket.on('connect_error', (err) => {
    guiPrintCallback('Broker connection error: ' + err.message);
  });

  socket.on('disconnect', () => {
    guiPrintCallback('Node disconnected from Broker');
  });
}
