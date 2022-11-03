import { Socket } from 'socket.io-client';
import SlaveP2PConnection from '../../p2p/connections/SlaveP2PConnection';
import MapReduceMasterJob from '../mapreduce/jobs/MapReduceMasterJob';
import MapWorkerJob from '../mapreduce/jobs/MapWorkerJob';
import Job from './Job';

export default function createJob(
  payload: any,
  slaveP2PConnection: SlaveP2PConnection,
  brokerServiceSocket: Socket,
  interconnectedNodeId: string
): Job {
  switch (payload.name) {
    case 'MAPREDUCE_MASTER':
      return new MapReduceMasterJob(
        payload.params,
        slaveP2PConnection,
        brokerServiceSocket,
        interconnectedNodeId
      );
    case 'MAP_WORKER':
      return new MapWorkerJob(payload.params, slaveP2PConnection);
    default:
      throw new Error('Unrecognized job name in received START_JOB message');
  }
}
