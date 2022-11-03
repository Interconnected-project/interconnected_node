import { Socket } from 'socket.io-client';
import JobsRepository from '../../contribution/common/JobsRepository';
import SlaveP2PConnectionsHub from '../../p2p/hubs/SlaveP2PConnectionsHub';
import BrokerServiceChannels from '../BrokerServiceChannels';

export default function applyOnRecruitmentBroadcastHandler(
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  slaveP2PConnectionsHub: SlaveP2PConnectionsHub,
  jobsRepository: JobsRepository
): void {
  brokerServiceSocket.on(
    BrokerServiceChannels.RECRUITMENT_BROADCAST,
    (payload: any) => {
      // TODO check requirements
      if (
        (payload.masterId !== interconnectedNodeId &&
          slaveP2PConnectionsHub.getByMasterId(payload.masterId) === undefined,
        jobsRepository.get(payload.operationId) === undefined)
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
