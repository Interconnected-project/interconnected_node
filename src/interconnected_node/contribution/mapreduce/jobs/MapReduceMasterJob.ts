import { Socket } from 'socket.io-client';
import BrokerServiceChannels from '../../../broker_service_socket/BrokerServiceChannels';
import MasterP2PConnection from '../../../p2p/connections/MasterP2PConnection';
import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Job from '../../common/Job';
import Task from '../../common/Task';

export default class MapReduceMasterJob implements Job {
  private mapWorkersToReach: number;
  private reduceWorkersToReach: number;
  private mapFunction: string;
  private reduceFunction: string;

  constructor(
    params: any,
    private slaveP2PConnection: SlaveP2PConnection,
    private brokerServiceSocket: Socket,
    private interconnectedNodeId: string
  ) {
    this.mapWorkersToReach = params.mapWorkers;
    this.reduceWorkersToReach = params.reduceWorkers;
    this.mapFunction = params.mapFunction;
    this.reduceFunction = params.reduceFunction;
  }

  get operationId(): string {
    return this.slaveP2PConnection.operationId;
  }

  start(): Promise<void> {
    this.brokerServiceSocket.emit(BrokerServiceChannels.RECRUITMENT_REQUEST, {
      operationId: this.operationId,
      nodesToReach: this.mapWorkersToReach,
      masterId: this.interconnectedNodeId,
      masterRole: 'NODE',
    });
    return new Promise<void>((resolve) => resolve());
  }

  notifyNewMasterP2PConnection(
    masterP2PConnection: MasterP2PConnection
  ): Promise<void> {
    console.log('new master p2p connection ' + masterP2PConnection.slaveId);
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
