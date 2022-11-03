import { Socket } from 'socket.io-client';
import JobsRepository from '../../contribution/common/JobsRepository';
import ClientSpecificP2PConnectionBuilders from '../../p2p/builders/ClientSpecificP2PConnectionBuilders';
import SlaveP2PConnectionsHub from '../../p2p/hubs/SlaveP2PConnectionsHub';
import handleSlaveP2PConnectionMessage from '../../p2p/message_handlers/slave/handleSlaveP2PConnectionMessage';
import BrokerServiceChannels from '../BrokerServiceChannels';

export default function applyOnRequestConnectionHandler(
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  slaveP2PConnectionsHub: SlaveP2PConnectionsHub,
  builders: ClientSpecificP2PConnectionBuilders,
  jobsRepository: JobsRepository
): void {
  brokerServiceSocket.on(
    BrokerServiceChannels.REQUEST_CONNECTION,
    async (payload: any) => {
      if (
        payload.masterId !== interconnectedNodeId &&
        slaveP2PConnectionsHub.getByMasterId(payload.masterId) === undefined &&
        jobsRepository.get(payload.operationId) === undefined
      ) {
        const slaveConnectionBuilder =
          builders.createNewSlaveP2PConnectionBuilder();

        const slaveP2PConnection = slaveConnectionBuilder
          .setOperationId(payload.operationId)
          .setMasterId(payload.masterId)
          .setMasterRole(payload.masterRole)
          .setOnIceCandidateHandler((candidate: any) => {
            brokerServiceSocket.emit(BrokerServiceChannels.ICE_CANDIDATE, {
              fromId: interconnectedNodeId,
              fromRole: 'NODE',
              toId: payload.masterId,
              toRole: payload.masterRole,
              candidate: candidate,
            });
          })
          .setOnMessageHandler((msg: any) => {
            handleSlaveP2PConnectionMessage(
              msg,
              brokerServiceSocket,
              interconnectedNodeId,
              jobsRepository
            );
          })
          .setOnDisconnectionHandler(() => {
            const slaveConnection = slaveP2PConnectionsHub.removeByMasterId(
              payload.masterId
            );
            if (slaveConnection !== undefined) {
              jobsRepository.remove(payload.operationId)?.stop();
              slaveConnection.close();
            }
          })
          .build();
        if (slaveP2PConnectionsHub.add(slaveP2PConnection)) {
          await slaveP2PConnection.setRemoteDescription(payload.sdp);
          const answer = await slaveP2PConnection.createAnswer();
          await slaveP2PConnection.setLocalDescription(answer);
          payload.sdp = answer;
          brokerServiceSocket.emit(
            BrokerServiceChannels.ANSWER_CONNECTION,
            payload
          );
          return;
        }
      }
      brokerServiceSocket.emit(
        BrokerServiceChannels.REQUEST_CONNECTION,
        'ERROR'
      );
    }
  );
}
