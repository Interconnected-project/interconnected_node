import { Socket } from 'socket.io-client';
import SlaveP2PConnection from '../../p2p/connections/SlaveP2PConnection';
import Task from './Task';

export default function createTask(
  payload: any,
  slaveP2PConnection: SlaveP2PConnection,
  brokerServiceSocket: Socket,
  interconnectedNodeId: string
): Task {
  throw new Error('TODO implement createTask');
}
