import MasterP2PConnection from '../../../p2p/connections/MasterP2PConnection';
import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Job from '../../common/Job';
import Task from '../../common/Task';

export default class ReduceWorkerJob implements Job {
  private reduceFunction: string;

  constructor(params: any, private slaveP2PConnection: SlaveP2PConnection) {
    this.reduceFunction = params.reduceFunction;
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
    throw new Error('Method not implemented.');
  }

  enqueueTask(task: Task): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      task.execute(
        {
          reduceFunction: this.reduceFunction,
          slaveP2PConnection: this.slaveP2PConnection,
        },
        () => console.log('COMPLETED REDUCE TASK'),
        () => console.log('ERROR ON REDUCE TASK')
      );
      resolve(true);
    });
  }

  notifyNewMasterP2PConnection(
    masterP2PConnection: MasterP2PConnection
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
    throw new Error('Method not implemented.');
  }
}
