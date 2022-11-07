import MasterP2PConnection from '../../../p2p/connections/MasterP2PConnection';
import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Job from '../../common/Job';
import Task from '../../common/Task';

export default class ReduceWorkerJob implements Job {
  private reduceFunction: string;
  private isExecutingTask: boolean;
  private tasks: Array<Task>;

  constructor(params: any, private slaveP2PConnection: SlaveP2PConnection) {
    this.reduceFunction = params.reduceFunction;
    this.isExecutingTask = false;
    this.tasks = new Array<Task>();
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

  private taskExecution(task: Task): Promise<void> {
    return new Promise<void>((resolve) => {
      this.isExecutingTask = true;
      task
        .execute(
          {
            reduceFunction: this.reduceFunction,
            slaveP2PConnection: this.slaveP2PConnection,
          },
          () => console.log('COMPLETED REDUCE TASK'),
          () => console.log('ERROR ON REDUCE TASK')
        )
        .then(() => {
          const nextTask = this.tasks.shift();
          if (nextTask !== undefined) {
            this.taskExecution(nextTask);
          } else {
            this.isExecutingTask = false;
          }
          resolve();
        });
    });
  }

  enqueueTask(task: Task): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (this.isExecutingTask) {
        this.tasks.push(task);
      } else {
        this.taskExecution(task);
      }
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
    // does not need any message notification
    return new Promise<void>((resolve) => {
      resolve();
    });
  }
}
