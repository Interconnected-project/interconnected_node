import { Socket } from 'socket.io-client';
import JobsRepository from '../../../contribution/common/JobsRepository';
import SlaveP2PConnection from '../../connections/SlaveP2PConnection';
import MasterP2PConnectionsHub from '../../hubs/MasterP2PConnectionsHub';
import onExecuteTaskMessageHandler from './handlers/onExecuteTaskMessageHandler';
import onSlaveStartJobMessageHandler from './handlers/onSlaveStartJobMessageHandler';

export default function handleSlaveP2PConnectionMessage(
  msg: any,
  slaveP2PConnection: SlaveP2PConnection,
  masterP2PConnectionsHub: MasterP2PConnectionsHub,
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  jobsRepository: JobsRepository
) {
  const parsedMsg = JSON.parse(msg);
  switch (parsedMsg.channel) {
    case 'START_JOB':
      onSlaveStartJobMessageHandler(
        parsedMsg.payload,
        slaveP2PConnection,
        masterP2PConnectionsHub,
        brokerServiceSocket,
        interconnectedNodeId,
        jobsRepository
      );
      break;
    case 'EXECUTE_TASK':
      onExecuteTaskMessageHandler(
        parsedMsg.payload,
        slaveP2PConnection,
        jobsRepository
      );
      break;
    default:
      throw new Error('Unrecognized P2P message received');
  }
}
