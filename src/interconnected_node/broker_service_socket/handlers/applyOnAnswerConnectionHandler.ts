import { Socket } from 'socket.io-client';
import MasterP2PConnectionsHub from '../../p2p/hubs/MasterP2PConnectionsHub';
import BrokerServiceChannels from '../BrokerServiceChannels';

export default function applyOnAnswerConnectionHandler(
  brokerServiceSocket: Socket,
  masterP2PConnectionsHub: MasterP2PConnectionsHub
): void {
  brokerServiceSocket.on(
    BrokerServiceChannels.ANSWER_CONNECTION,
    (payload: any) => {
      const masterConnection = masterP2PConnectionsHub.getBySlaveId(
        payload.slaveId
      );
      if (masterConnection !== undefined) {
        masterConnection.setRemoteDescription(payload.sdp);
      } else {
        brokerServiceSocket.emit(
          BrokerServiceChannels.ANSWER_CONNECTION,
          'ERROR'
        );
      }
    }
  );
}
