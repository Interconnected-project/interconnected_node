import MasterP2PConnection from '../../p2p/connections/MasterP2PConnection';
import Task from './Task';

export default interface Job {
  get operationId(): string;

  start(): Promise<void>;

  stop(): Promise<void>;

  enqueueTask(task: Task): Promise<boolean>;

  notifyNewMasterP2PConnection(
    masterP2PConnection: MasterP2PConnection
  ): Promise<void>;

  notifyNewMessage(
    masterP2PConnection: MasterP2PConnection,
    msg: any
  ): Promise<void>;
}
