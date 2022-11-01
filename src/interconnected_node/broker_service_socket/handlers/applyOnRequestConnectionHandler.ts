import { Socket } from 'socket.io-client';
import ClientSpecificP2PConnectionBuilders from '../../p2p/builders/ClientSpecificP2PConnectionBuilders';
import SlaveP2PConnectionsHub from '../../p2p/hubs/SlaveP2PConnectionsHub';
import BrokerServiceChannels from '../BrokerServiceChannels';

export default function applyOnRequestConnectionHandler(
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  slaveP2PConnectionsHub: SlaveP2PConnectionsHub,
  builders: ClientSpecificP2PConnectionBuilders
): void {
  brokerServiceSocket.on(
    BrokerServiceChannels.REQUEST_CONNECTION,
    async (payload: any) => {
      if (
        payload.masterId !== interconnectedNodeId &&
        slaveP2PConnectionsHub.getByMasterId(payload.masterId) === undefined
        // TODO check that I'm not involved in a job that has the same operationId
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
            //TODO implement actual message handlers
            console.log(msg);
          })
          .setOnDisconnectionHandler(() => {
            const slaveConnection = slaveP2PConnectionsHub.removeByMasterId(
              payload.masterId
            );
            slaveConnection?.close();
            //TODO stop connected jobs
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
