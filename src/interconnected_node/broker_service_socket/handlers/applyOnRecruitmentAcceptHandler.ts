import { Socket } from 'socket.io-client';
import ClientSpecificP2PConnectionBuilders from '../../p2p/builders/ClientSpecificP2PConnectionBuilders';
import MasterP2PConnectionsHub from '../../p2p/hubs/MasterP2PConnectionsHub';
import BrokerServiceChannels from '../BrokerServiceChannels';

export default function applyOnRecruitmentAcceptHandler(
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  builders: ClientSpecificP2PConnectionBuilders,
  masterP2PConnectionsHub: MasterP2PConnectionsHub
): void {
  brokerServiceSocket.on(
    BrokerServiceChannels.RECRUITMENT_ACCEPT,
    async (payload: any) => {
      const masterP2PConnection = builders
        .createNewMasterP2PConnectionBuilder()
        .setSlaveId(payload.slaveId)
        .setOperationId(payload.operationId)
        .setOnIceCandidateHandler((candidate: any) => {
          brokerServiceSocket.emit(BrokerServiceChannels.ICE_CANDIDATE, {
            fromId: interconnectedNodeId,
            fromRole: 'NODE',
            toId: payload.slaveId,
            toRole: 'NODE',
            candidate: candidate,
          });
        })
        .setOnMessageHandler((msg: any) => {
          // TODO implement actual handler
          console.log('Slave sent this message: ' + msg);
        })
        .setOnDisconnectionHandler(() => {
          const masterConnection = masterP2PConnectionsHub.getBySlaveId(
            payload.slaveId
          );
          masterConnection?.close();
          // TODO probably have to notify jobs
        })
        .build();
      if (masterP2PConnectionsHub.add(masterP2PConnection)) {
        const offer = await masterP2PConnection.createOffer();
        payload.sdp = offer;
        await masterP2PConnection.setLocalDescription(offer);
        brokerServiceSocket.emit(
          BrokerServiceChannels.ANSWER_CONNECTION,
          payload
        );
      } else {
        brokerServiceSocket.emit(
          BrokerServiceChannels.RECRUITMENT_ACCEPT,
          'ERROR'
        );
      }
    }
  );
}
