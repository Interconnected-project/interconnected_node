import { Socket } from 'socket.io-client';
import JobsRepository from '../../../contribution/common/JobsRepository';
import SlaveP2PConnection from '../../connections/SlaveP2PConnection';

export default function handleSlaveP2PConnectionMessage(
  msg: any,
  slaveP2PConnection: SlaveP2PConnection,
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  jobsRepository: JobsRepository
) {
  console.log('Received message ' + msg);
  switch (msg.channel) {
    case 'START_JOB':
      onStartJob(msg.payload);
      break;
    default:
      throw new Error('Unrecognized P2P message received');
  }
}

function onStartJob(payload: any): void {
  // TODO
}
