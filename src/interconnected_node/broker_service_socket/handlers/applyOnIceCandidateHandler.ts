import { Socket } from 'socket.io-client';
import MasterP2PConnectionsHub from '../../p2p/hubs/MasterP2PConnectionsHub';
import SlaveP2PConnectionsHub from '../../p2p/hubs/SlaveP2PConnectionsHub';
import BrokerServiceChannels from '../BrokerServiceChannels';

export default function applyOnIceCandidateHandler(
  brokerServiceSocket: Socket,
  interconnectedNodeId: string,
  slaveP2PConnectionsHub: SlaveP2PConnectionsHub,
  masterP2PConnectionsHub: MasterP2PConnectionsHub
): void {
  brokerServiceSocket.on(
    BrokerServiceChannels.ICE_CANDIDATE,
    (payload: any) => {
      if (
        payload.candidate !== undefined &&
        payload.toId === interconnectedNodeId
      ) {
        const masterP2P = masterP2PConnectionsHub.getBySlaveId(payload.fromId);
        if (masterP2P !== undefined) {
          masterP2P.addIceCandidate(payload.candidate);
        } else {
          const slaveP2P = slaveP2PConnectionsHub.getByMasterId(payload.fromId);
          if (slaveP2P !== undefined) {
            slaveP2P.addIceCandidate(payload.candidate);
          }
        }
      }
    }
  );
}
