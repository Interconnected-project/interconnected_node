import { Socket } from 'socket.io-client';
import JobsRepository from '../contribution/common/JobsRepository';

import ClientSpecificP2PConnectionBuilders from '../p2p/builders/ClientSpecificP2PConnectionBuilders';
import MasterP2PConnectionsHub from '../p2p/hubs/MasterP2PConnectionsHub';
import SlaveP2PConnectionsHub from '../p2p/hubs/SlaveP2PConnectionsHub';
import DeviceType from './DeviceType';
import applyOnAnswerConnectionHandler from './handlers/applyOnAnswerConnectionHandler';
import applyOnIceCandidateHandler from './handlers/applyOnIceCandidateHandler';
import applyOnRecruitmentAcceptHandler from './handlers/applyOnRecruitmentAcceptHandler';
import applyOnRecruitmentBroadcastHandler from './handlers/applyOnRecruitmentBroadcastHandler';
import applyOnRequestConnectionHandler from './handlers/applyOnRequestConnectionHandler';

export default function applyBrokerServiceSocketHandlers(
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  slaveP2PConnectionsHub: SlaveP2PConnectionsHub,
  masterP2PConnectionsHub: MasterP2PConnectionsHub,
  jobsRepository: JobsRepository,
  builders: ClientSpecificP2PConnectionBuilders,
  deviceType: DeviceType
) {
  brokerServiceSocket.on('connect', () => {
    console.log('Node connected to Broker!');
  });

  brokerServiceSocket.on('connect_error', (err) => {
    console.log('Broker connection error: ' + err.message);
  });

  applyOnRecruitmentBroadcastHandler(
    brokerServiceSocket,
    interconnectedNodeId,
    slaveP2PConnectionsHub,
    jobsRepository,
    deviceType
  );

  applyOnRecruitmentAcceptHandler(
    brokerServiceSocket,
    interconnectedNodeId,
    builders,
    masterP2PConnectionsHub,
    jobsRepository
  );

  applyOnRequestConnectionHandler(
    brokerServiceSocket,
    interconnectedNodeId,
    slaveP2PConnectionsHub,
    masterP2PConnectionsHub,
    builders,
    jobsRepository
  );

  applyOnAnswerConnectionHandler(brokerServiceSocket, masterP2PConnectionsHub);

  applyOnIceCandidateHandler(
    brokerServiceSocket,
    interconnectedNodeId,
    slaveP2PConnectionsHub,
    masterP2PConnectionsHub
  );
}
