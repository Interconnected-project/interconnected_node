import { Socket } from 'socket.io-client';
import { runInThisContext } from 'vm';
import BrokerServiceChannels from '../../../broker_service_socket/BrokerServiceChannels';
import MasterP2PConnection from '../../../p2p/connections/MasterP2PConnection';
import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import MasterP2PConnectionsHub from '../../../p2p/hubs/MasterP2PConnectionsHub';
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
  private currentUsedReduceWorkerIndex: number;
  private reduceWorkersToReach: number;
  private reduceWorkers: Array<MasterP2PConnection>;
  private reduceWorkersJobAcks: Map<string, boolean>;
  private reduceWorkersJobGuard: boolean;
  private mapFunction: string;
  private reduceFunction: string;
  private enqueuedTasks: Array<Task>;
  private intermediateResults: Map<string, Object[]>;

  constructor(
    params: any,
    private slaveP2PConnection: SlaveP2PConnection,
    private masterP2PConnectionsHub: MasterP2PConnectionsHub,
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
    this.currentUsedReduceWorkerIndex = Math.floor(
      Math.random() * this.reduceWorkersToReach
    );
    this.reduceWorkersJobAcks = new Map();
    this.reduceWorkersJobGuard = false;
    this.reduceFunction = params.reduceFunction;
    this.enqueuedTasks = new Array();
    this.mapWorkersPerRegion = Math.ceil(
      this.mapWorkersToReach / this.reduceWorkersToReach
    );
    this.intermediateResults = new Map();
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
    this.reduceWorkersJobAcks.set(masterP2PConnection.slaveId, false);
    if (this.reduceWorkers.length === this.reduceWorkersToReach) {
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
    return new Promise<void>((resolve) => {
      this.masterP2PConnectionsHub
        .removeByOperationId(this.slaveP2PConnection.operationId)
        .forEach((c) => c.close());
      resolve();
    });
  }

  private executeSplit(task: Task): void {
    const mwUsed = new Array<MasterP2PConnection>();
    const remainingMWsFromIndex =
      this.mapWorkers.length - this.currentUsedMapWorkerIndex;
    if (remainingMWsFromIndex >= this.mapWorkersPerRegion) {
      mwUsed.push(
        ...this.mapWorkers.slice(
          this.currentUsedMapWorkerIndex,
          this.currentUsedMapWorkerIndex + this.mapWorkersPerRegion
        )
      );
    } else {
      mwUsed.push(
        ...this.mapWorkers.slice(
          this.currentUsedMapWorkerIndex,
          this.currentUsedMapWorkerIndex + remainingMWsFromIndex
        )
      );
      mwUsed.push(
        ...this.mapWorkers.slice(
          0,
          this.mapWorkersPerRegion - remainingMWsFromIndex
        )
      );
    }
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

  private sendReduceTask(regionId: string, intermediateResult: Object[]): void {
    const interval = setInterval(() => {
      if (this.reduceWorkersJobGuard === true) {
        clearInterval(interval);
        const rw = this.reduceWorkers[this.currentUsedReduceWorkerIndex];
        if (++this.currentUsedReduceWorkerIndex === this.reduceWorkers.length) {
          this.currentUsedReduceWorkerIndex = 0;
        }
        rw.sendMessage(
          JSON.stringify({
            channel: 'EXECUTE_TASK',
            payload: {
              name: 'MAPREDUCE_REDUCE',
              params: {
                regionId: regionId,
                intermediateResult: intermediateResult,
              },
            },
          })
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
    } else if (
      parsedMsg.channel === 'START_JOB' &&
      parsedMsg.payload.name === 'REDUCE_WORKER' &&
      parsedMsg.payload.result === 'ACK'
    ) {
      this.reduceWorkersJobAcks.set(masterP2PConnection.slaveId, true);
      if (
        this.reduceWorkersJobAcks.size === this.reduceWorkersToReach &&
        Array.from(this.reduceWorkersJobAcks.values()).every((s) => {
          return s === true;
        })
      ) {
        this.reduceWorkersJobGuard = true;
        console.log('REDUCE WORKERS JOB GUARD DISABLED');
      }
    } else if (
      parsedMsg.channel === 'TASK_COMPLETED' &&
      parsedMsg.payload.name === 'MAPREDUCE_MAP'
    ) {
      const regionId = parsedMsg.payload.params.regionId;
      const mapWorkerIntermediateResults =
        parsedMsg.payload.params.intermediateResults;
      const accumulatedMWIntermediateResults =
        this.intermediateResults.get(regionId);
      let updatedIntermediateResults: Object[];
      if (accumulatedMWIntermediateResults === undefined) {
        updatedIntermediateResults = mapWorkerIntermediateResults;
      } else {
        updatedIntermediateResults = accumulatedMWIntermediateResults.concat(
          mapWorkerIntermediateResults
        );
      }
      this.intermediateResults.set(regionId, updatedIntermediateResults);
      if (
        updatedIntermediateResults.length ===
        parsedMsg.payload.params.splitsTotal
      ) {
        console.log(
          'RECEIVED ALL IRs FOR REGION ' +
            regionId +
            '\n' +
            updatedIntermediateResults
        );
        this.intermediateResults.delete(regionId);
        this.sendReduceTask(regionId, updatedIntermediateResults);
      }
    } else if (
      parsedMsg.channel === 'TASK_COMPLETED' &&
      parsedMsg.payload.name === 'MAPREDUCE_REDUCE'
    ) {
      console.log(parsedMsg);
      this.slaveP2PConnection.sendMessage(
        JSON.stringify({
          channel: 'TASK_COMPLETED',
          payload: {
            name: 'MAPREDUCE_REGION_SPLITS',
            params: {
              regionId: parsedMsg.payload.params.regionId,
              result: parsedMsg.payload.params.result,
            },
          },
        })
      );
    }
    return new Promise<void>((resolve) => resolve());
  }
}
