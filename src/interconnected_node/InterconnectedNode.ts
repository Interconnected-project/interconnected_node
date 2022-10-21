import { io, Socket } from 'socket.io-client';

// import ConnectivityLayer from './connectivity_layer/ConnectivityLayer';
// import FabricLayer from './fabric_layer/FabricLayer';
// import ResourceLayer from './resource_layer/ResourceLayer';

export default class InterconnectedNode {
  //private connectivityLayer: ConnectivityLayer;
  //private resourceLayer: ResourceLayer;
  private socket: Socket | undefined;

  constructor(/*private fabricLayer: FabricLayer*/) {
    //this.connectivityLayer = new ConnectivityLayer(fabricLayer);
    //this.resourceLayer = new ResourceLayer(fabricLayer, this.connectivityLayer);
    this.socket = undefined;
  }

  start(
    mac: string,
    guiPrintCallback: (msg: string) => void,
    backgroundPrintCallback: (msg: string) => void
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.socket !== undefined) {
        reject();
      } else {
        this.socket = io(
          'http://ec2-3-208-18-248.compute-1.amazonaws.com:8000',
          {
            autoConnect: false,
            query: {
              mac: mac,
            },
          }
        );

        this.socket.on('connect', function () {
          guiPrintCallback('Node connected!');
        });

        this.socket.on('disconnect', function () {
          guiPrintCallback('Node disconnected!');
        });

        this.socket.on('connect_error', (err: { message: string }) => {
          guiPrintCallback('ERROR\n' + err.message);
        });

        this.socket.on('RECRUITMENT', (payload: string) => {
          backgroundPrintCallback(payload);
        });

        this.socket.on('TEST', (msg: string) => {
          backgroundPrintCallback('Test response: ' + msg);
        });

        this.socket.connect();
        resolve();
      }
    });
  }

  stop(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.socket === undefined) {
        reject();
      } else {
        this.socket.disconnect();
        this.socket = undefined;
        resolve();
      }
    });
  }

  test(): void {
    this.socket?.emit('TEST');
  }

  isRunning(): Promise<boolean> {
    return new Promise<boolean>(() => {
      throw new Error('Not implemented');
    });
  }

  isConnectedToGrid(): Promise<boolean> {
    return new Promise<boolean>(() => {
      throw new Error('Not implemented');
    });
  }

  isExecutingTasks(): Promise<boolean> {
    return new Promise<boolean>(() => {
      throw new Error('Not implemented');
    });
  }
}
