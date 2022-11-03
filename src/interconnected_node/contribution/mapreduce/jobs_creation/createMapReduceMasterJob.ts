import { Socket } from 'socket.io-client';
import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Job from '../../common/Job';

export default function createMapReduceMasterJob(
  params: any,
  slaveP2PConnection: SlaveP2PConnection,
  brokerServiceSocket: Socket,
  interconnectedNodeId: string
): Job {
  console.log(params);
  throw new Error('TODO implement');
}
