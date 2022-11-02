import { Socket } from 'socket.io-client';

import ClientSpecificP2PConnectionBuilders from '../p2p/builders/ClientSpecificP2PConnectionBuilders';
import MasterP2PConnectionsHub from '../p2p/hubs/MasterP2PConnectionsHub';
import SlaveP2PConnectionsHub from '../p2p/hubs/SlaveP2PConnectionsHub';
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
  builders: ClientSpecificP2PConnectionBuilders
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
    slaveP2PConnectionsHub
  );

  applyOnRecruitmentAcceptHandler(
    brokerServiceSocket,
    interconnectedNodeId,
    builders,
    masterP2PConnectionsHub
  );

  applyOnRequestConnectionHandler(
    brokerServiceSocket,
    interconnectedNodeId,
    slaveP2PConnectionsHub,
    builders
  );

  applyOnAnswerConnectionHandler(brokerServiceSocket, masterP2PConnectionsHub);

  applyOnIceCandidateHandler(
    brokerServiceSocket,
    interconnectedNodeId,
    slaveP2PConnectionsHub,
    masterP2PConnectionsHub
  );
}
