import MasterP2PConnection from '../../../p2p/connections/MasterP2PConnection';
import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Job from '../../common/Job';
import Task from '../../common/Task';

export default class MapWorkerJob implements Job {
  private mapFunction: string;

  constructor(params: any, private slaveP2PConnection: SlaveP2PConnection) {
    this.mapFunction = params.mapFunction;
  }

  get operationId(): string {
    return this.slaveP2PConnection.operationId;
  }

  start(): Promise<void> {
    return new Promise<void>((resolve) => {
      resolve();
    });
  }

  stop(): Promise<void> {
    // does not need to do anything on stop
    return new Promise<void>((resolve) => {
      resolve();
    });
  }

  enqueueTask(task: Task): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      task.execute(
        {
          mapFunction: this.mapFunction,
          slaveP2PConnection: this.slaveP2PConnection,
        },
        () => console.log('COMPLETED MAP TASK'),
        () => console.log('ERROR ON MAP TASK')
      );
      resolve(true);
    });
  }

  notifyNewMasterP2PConnection(
    _masterP2PConnection: MasterP2PConnection
  ): Promise<void> {
    // does not need any MasterP2PConnection
    return new Promise<void>((resolve) => {
      resolve();
    });
  }

  notifyNewMessage(
    masterP2PConnection: MasterP2PConnection,
    msg: any
  ): Promise<void> {
    // does not need any message notification
    return new Promise<void>((resolve) => {
      resolve();
    });
  }
}
