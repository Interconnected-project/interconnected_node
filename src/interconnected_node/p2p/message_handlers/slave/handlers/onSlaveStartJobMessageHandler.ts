import { Socket } from 'socket.io-client';
import JobsRepository from '../../../../contribution/common/JobsRepository';
import SlaveP2PConnection from '../../../connections/SlaveP2PConnection';

export default function onSlaveStartJobMessageHandler(
  payload: any,
  slaveP2PConnection: SlaveP2PConnection,
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  jobsRepository: JobsRepository
): void {
  // TODO
}
