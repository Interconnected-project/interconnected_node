import { Socket } from 'socket.io-client';
import Job from './Job';
import MasterP2PConnection from './MasterP2PConnection';

export default class MapReduceMasterJob implements Job {
  constructor(
    private params: any,
    private masterP2PConnection: MasterP2PConnection,
    private brokerSocket: Socket
  ) {
    // does nothing
  }

  start(): void {
    this.performJob();
    this.masterP2PConnection.sendP2PMessage(
      JSON.stringify({
        channel: 'START_JOB',
        payload: {
          response: 'ACK',
        },
      })
    );
  }

  private async performJob(): Promise<void> {
    console.log('starting job');
  }
}
