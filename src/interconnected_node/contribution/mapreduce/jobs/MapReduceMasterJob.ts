import { Socket } from 'socket.io-client';
import BrokerServiceChannels from '../../../broker_service_socket/BrokerServiceChannels';
import MasterP2PConnection from '../../../p2p/connections/MasterP2PConnection';
import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Job from '../../common/Job';
import Task from '../../common/Task';

enum Status {
  MAP_WORKERS_RECRUITMENT,
  REDUCE_WORKERS_RECRUITMENT,
  RECRUITMENT_COMPLETED,
}

export default class MapReduceMasterJob implements Job {
  private status: Status;
  private currentUsedMapWorkerIndex: number;
  private mapWorkersToReach: number;
  private mapWorkers: Array<MasterP2PConnection>;
  private mapWorkersJobAcks: Map<string, boolean>;
  private mapWorkersJobGuard: boolean;
  private mapWorkersPerRegion: number;
  private reduceWorkersToReach: number;
  private reduceWorkers: Array<MasterP2PConnection>;
  private mapFunction: string;
  private reduceFunction: string;
  private enqueuedTasks: Array<Task>;

  constructor(
    params: any,
    private slaveP2PConnection: SlaveP2PConnection,
    private brokerServiceSocket: Socket,
    private interconnectedNodeId: string
  ) {
    this.status = Status.MAP_WORKERS_RECRUITMENT;
    this.mapWorkersToReach = params.mapWorkers;
    this.currentUsedMapWorkerIndex = Math.floor(
      Math.random() * this.mapWorkersToReach
    );
    this.mapWorkers = new Array<MasterP2PConnection>();
    this.mapWorkersJobAcks = new Map();
    this.mapWorkersJobGuard = false;
    this.reduceWorkersToReach = params.reduceWorkers;
    this.reduceWorkers = new Array<MasterP2PConnection>();
    this.mapFunction = params.mapFunction;
    this.reduceFunction = params.reduceFunction;
    this.enqueuedTasks = new Array();
    this.mapWorkersPerRegion = Math.ceil(
      this.mapWorkersToReach / this.reduceWorkersToReach
    );
  }

  get operationId(): string {
    return this.slaveP2PConnection.operationId;
  }

  start(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.brokerServiceSocket.emit(BrokerServiceChannels.RECRUITMENT_REQUEST, {
        operationId: this.operationId,
        nodesToReach: this.mapWorkersToReach,
        masterId: this.interconnectedNodeId,
        masterRole: 'NODE',
      });
      resolve();
    });
  }

  private onNewMapWorker(
    masterP2PConnection: MasterP2PConnection
  ): Promise<void> {
    this.mapWorkers.push(masterP2PConnection);
    this.mapWorkersJobAcks.set(masterP2PConnection.slaveId, false);
    if (this.mapWorkers.length === this.mapWorkersToReach) {
      this.status = Status.REDUCE_WORKERS_RECRUITMENT;
      console.log('MAP WORKERS RECRUITED');
      const switchToReduceWorkersRecruitmentInterval = setInterval(() => {
        if (this.mapWorkers.every((mw) => mw.remoteDescription !== undefined)) {
          this.brokerServiceSocket.emit(
            BrokerServiceChannels.RECRUITMENT_REQUEST,
            {
              operationId: this.operationId,
              nodesToReach: this.reduceWorkersToReach,
              masterId: this.interconnectedNodeId,
              masterRole: 'NODE',
            }
          );
          while (this.enqueuedTasks.length > 0) {
            const poppedTask = this.enqueuedTasks.pop();
            if (poppedTask !== undefined) {
              this.executeSplit(poppedTask);
            }
          }
          clearInterval(switchToReduceWorkersRecruitmentInterval);
        }
      }, 100);
    }
    return new Promise<void>((resolve) => {
      masterP2PConnection.sendMessage(
        JSON.stringify({
          channel: 'START_JOB',
          payload: {
            name: 'MAP_WORKER',
            params: {
              mapFunction: this.mapFunction,
            },
          },
        })
      );
      resolve();
    });
  }

  private onNewReduceWorker(
    masterP2PConnection: MasterP2PConnection
  ): Promise<void> {
    this.reduceWorkers.push(masterP2PConnection);
    if (this.mapWorkers.length === this.mapWorkersToReach) {
      this.status = Status.RECRUITMENT_COMPLETED;
      console.log('RECRUITMENT COMPLETED');
    }
    return new Promise<void>((resolve) => {
      masterP2PConnection.sendMessage(
        JSON.stringify({
          channel: 'START_JOB',
          payload: {
            name: 'REDUCE_WORKER',
            params: {
              reduceFunction: this.reduceFunction,
            },
          },
        })
      );
      resolve();
    });
  }

  notifyNewMasterP2PConnection(
    masterP2PConnection: MasterP2PConnection
  ): Promise<void> {
    if (masterP2PConnection.operationId === this.operationId) {
      switch (this.status) {
        case Status.MAP_WORKERS_RECRUITMENT:
          return this.onNewMapWorker(masterP2PConnection);
        case Status.REDUCE_WORKERS_RECRUITMENT:
          return this.onNewReduceWorker(masterP2PConnection);
        default:
          throw new Error(
            'Received new worker after MapReduce recruitment completed'
          );
      }
    }
    return new Promise<void>((resolve) => resolve());
  }

  stop(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private executeSplit(task: Task): void {
    const mwUsed = new Array<MasterP2PConnection>();
    const remainingMWsFromIndex =
      this.mapWorkers.length - this.currentUsedMapWorkerIndex;
    console.log('length ' + this.mapWorkers.length.toString());
    console.log('index ' + this.currentUsedMapWorkerIndex.toString());
    console.log('remaining ' + remainingMWsFromIndex.toString());
    console.log('per region ' + this.mapWorkersPerRegion);
    if (remainingMWsFromIndex >= this.mapWorkersPerRegion) {
      console.log('A');
      mwUsed.push(
        ...this.mapWorkers.slice(
          this.currentUsedMapWorkerIndex,
          this.mapWorkersPerRegion
        )
      );
    } else {
      console.log('B');
      mwUsed.push(
        ...this.mapWorkers.slice(
          this.currentUsedMapWorkerIndex,
          remainingMWsFromIndex
        )
      );
      mwUsed.push(
        ...this.mapWorkers.slice(
          0,
          this.mapWorkersPerRegion - remainingMWsFromIndex
        )
      );
    }
    console.log(mwUsed.length.toString());
    this.currentUsedMapWorkerIndex += this.mapWorkersPerRegion;
    if (this.currentUsedMapWorkerIndex >= this.mapWorkers.length) {
      this.currentUsedMapWorkerIndex =
        this.mapWorkersPerRegion - remainingMWsFromIndex;
    }
    const interval = setInterval(() => {
      if (this.mapWorkersJobGuard === true) {
        clearInterval(interval);
        task.execute(
          { mapWorkers: mwUsed },
          () => {
            console.log('MASTER COMPLETED SLICE TASK');
          },
          () => {
            'MASTER HAD AN ERROR COMPLETING SLICE TASK';
          }
        );
      }
    }, 100);
  }

  enqueueTask(task: Task): Promise<boolean> {
    if (this.status === Status.MAP_WORKERS_RECRUITMENT) {
      console.log('RECEIVED TASK, BUT ENQUEUED IT');
      this.enqueuedTasks.push(task);
    } else {
      this.executeSplit(task);
    }
    return new Promise<boolean>((resolve) => resolve(true));
  }

  notifyNewMessage(
    masterP2PConnection: MasterP2PConnection,
    msg: any
  ): Promise<void> {
    const parsedMsg = JSON.parse(msg);
    if (
      parsedMsg.channel === 'START_JOB' &&
      parsedMsg.payload.name === 'MAP_WORKER' &&
      parsedMsg.payload.result === 'ACK'
    ) {
      this.mapWorkersJobAcks.set(masterP2PConnection.slaveId, true);
      if (
        this.mapWorkersJobAcks.size === this.mapWorkersToReach &&
        Array.from(this.mapWorkersJobAcks.values()).every((s) => {
          return s === true;
        })
      ) {
        this.mapWorkersJobGuard = true;
      }
    }
    return new Promise<void>((resolve) => resolve());
  }
}
