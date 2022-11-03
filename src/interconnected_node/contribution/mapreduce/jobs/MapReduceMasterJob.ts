import { Socket } from 'socket.io-client';
import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Job from '../../common/Job';
import Task from '../../common/Task';

export default class MapReduceMasterJob implements Job {
  constructor(
    params: any,
    slaveP2PConnection: SlaveP2PConnection,
    brokerServiceSocket: Socket,
    interconnectedNodeId: string
  ) {
    // TODO
  }
  get operationId(): string {
    throw new Error('Method not implemented.');
  }
  start(): Promise<void> {
    throw new Error('Method not implemented.');
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
