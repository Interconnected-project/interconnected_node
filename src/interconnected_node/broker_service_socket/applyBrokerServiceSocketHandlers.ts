import { Socket } from 'socket.io-client';

import ClientSpecificP2PConnectionBuilders from '../p2p/builders/ClientSpecificP2PConnectionBuilders';
import MasterP2PConnectionsHub from '../p2p/hubs/MasterP2PConnectionsHub';
import SlaveP2PConnectionsHub from '../p2p/hubs/SlaveP2PConnectionsHub';
import BrokerServiceChannels from './BrokerServiceChannels';

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
  // TODO
}

function applyOnRecruitmentBroadcastHandler(
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  slaveP2PConnectionsHub: SlaveP2PConnectionsHub
): void {
  brokerServiceSocket.on(
    BrokerServiceChannels.RECRUITMENT_BROADCAST,
    (payload: any) => {
      // TODO check requirements
      if (
        payload.masterId !== interconnectedNodeId &&
        slaveP2PConnectionsHub.getByMasterId(payload.masterId) === undefined
        // TODO check that I'm not involved in a job that has the same operationId
      ) {
        const recruitmentAcceptPayload = {
          masterId: payload.masterId,
          masterRole: payload.masterRole,
          operationId: payload.operationId,
          slaveId: interconnectedNodeId,
        };
        brokerServiceSocket.emit(
          BrokerServiceChannels.RECRUITMENT_ACCEPT,
          recruitmentAcceptPayload
        );
      }
    }
  );
}
