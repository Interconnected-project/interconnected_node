import { Socket } from 'socket.io-client';
import createTask from '../../../../contribution/common/createTask';
import JobsRepository from '../../../../contribution/common/JobsRepository';
import Task from '../../../../contribution/common/Task';
import SlaveP2PConnection from '../../../connections/SlaveP2PConnection';

export default function onExecuteTaskMessageHandler(
  payload: any,
  slaveP2PConnection: SlaveP2PConnection,
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  jobsRepository: JobsRepository
): void {
  let task: Task = createTask(
    payload,
    slaveP2PConnection,
    brokerServiceSocket,
    interconnectedNodeId
  );
  const response = {
    channel: 'EXECUTE_TASK',
    payload: {
      result: 'ACK',
    },
  };
  const targetJob = jobsRepository.get(slaveP2PConnection.operationId);
  if (targetJob !== undefined) {
    targetJob.enqueueTask(task).then((enqueued) => {
      if (!enqueued) {
        response.payload.result = 'ERROR';
      }
      slaveP2PConnection.sendMessage(JSON.stringify(response));
    });
  } else {
    response.payload.result = 'ERROR';
    slaveP2PConnection.sendMessage(JSON.stringify(response));
  }
}
