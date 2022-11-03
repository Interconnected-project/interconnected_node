import { Socket } from 'socket.io-client';
import createJob from '../../../../contribution/common/createJob';
import Job from '../../../../contribution/common/Job';
import JobsRepository from '../../../../contribution/common/JobsRepository';
import SlaveP2PConnection from '../../../connections/SlaveP2PConnection';

export default function onSlaveStartJobMessageHandler(
  payload: any,
  slaveP2PConnection: SlaveP2PConnection,
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  jobsRepository: JobsRepository
): void {
  let job: Job = createJob(
    payload,
    slaveP2PConnection,
    brokerServiceSocket,
    interconnectedNodeId
  );
  const response = {
    channel: 'START_JOB',
    payload: {
      result: 'ACK',
    },
  };
  if (job !== undefined && jobsRepository.add(job) === true) {
    job.start();
  } else {
    response.payload.result = 'ERROR';
  }
  slaveP2PConnection.sendMessage(JSON.stringify(response));
}
