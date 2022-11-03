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
  private mapWorkersToReach: number;
  private mapWorkers: Array<MasterP2PConnection>;
  private reduceWorkersToReach: number;
  private mapFunction: string;
  private reduceFunction: string;

  constructor(
    params: any,
    private slaveP2PConnection: SlaveP2PConnection,
    private brokerServiceSocket: Socket,
    private interconnectedNodeId: string
  ) {
    this.status = Status.MAP_WORKERS_RECRUITMENT;
    this.mapWorkersToReach = params.mapWorkers;
    this.mapWorkers = new Array<MasterP2PConnection>();
    this.reduceWorkersToReach = params.reduceWorkers;
    this.mapFunction = params.mapFunction;
    this.reduceFunction = params.reduceFunction;
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

  notifyNewMasterP2PConnection(
    masterP2PConnection: MasterP2PConnection
  ): Promise<void> {
    if (masterP2PConnection.operationId === this.operationId) {
      switch (this.status) {
        case Status.MAP_WORKERS_RECRUITMENT:
          this.mapWorkers.push(masterP2PConnection);
          if (this.mapWorkers.length === this.mapWorkersToReach) {
            this.status = Status.REDUCE_WORKERS_RECRUITMENT;
            const switchToReduceWorkersRecruitmentInterval = setInterval(() => {
              if (
                this.mapWorkers.every(
                  (mw) => mw.remoteDescription !== undefined
                )
              ) {
                this.brokerServiceSocket.emit(
                  BrokerServiceChannels.RECRUITMENT_REQUEST,
                  {
                    operationId: this.operationId,
                    nodesToReach: this.reduceWorkersToReach,
                    masterId: this.interconnectedNodeId,
                    masterRole: 'NODE',
                  }
                );
                clearInterval(switchToReduceWorkersRecruitmentInterval);
              }
            }, 100);
          }
          return new Promise<void>((resolve) => {
            // TODO send map job
            resolve();
          });
      }
    }
    return new Promise<void>((resolve) => resolve());
  }

  stop(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  enqueueTask(task: Task): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  suppressTask(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
