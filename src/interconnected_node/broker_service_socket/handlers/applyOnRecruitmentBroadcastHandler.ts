import { Socket } from 'socket.io-client';
import SlaveP2PConnectionsHub from '../../p2p/hubs/SlaveP2PConnectionsHub';
import BrokerServiceChannels from '../BrokerServiceChannels';

export default function applyOnRecruitmentBroadcastHandler(
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
      } else {
        brokerServiceSocket.emit(
          BrokerServiceChannels.RECRUITMENT_BROADCAST,
          'ERROR'
        );
      }
    }
  );
}
