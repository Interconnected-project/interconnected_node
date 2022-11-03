import { Socket } from 'socket.io-client';
import JobsRepository from '../../../contribution/common/JobsRepository';

export default function handleSlaveP2PConnectionMessage(
  msg: any,
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  jobsRepository: JobsRepository
) {
  // TODO
}
