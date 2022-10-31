/* eslint-disable @typescript-eslint/no-explicit-any */
import { Socket } from 'socket.io-client';
import MasterP2PConnection from '../masters_hub/MasterP2PConnection';
import MastersHub from '../masters_hub/MastersHub';
import SlavesHub from '../slaves_hub/SlavesHub';
import BrokerServiceChannels from './BrokerServiceChannels';

export default function applyBrokerServiceHandlers(
  socket: Socket,
  myId: string,
  onRequestConnectionHandler: (
    payload: any,
    emitIceCandidateCallback: (payload: any) => void,
    disconnectionCallback: () => void
  ) => Promise<MasterP2PConnection>
): void {
  socket.on('connect', () => {
    console.log('Node connected to Broker!');
  });

  socket.on('connect_error', (err) => {
    console.log('Broker connection error: ' + err.message);
  });

  // RECRUITMENT_BROADCAST handler
  socket.on(BrokerServiceChannels.RECRUITMENT_BROADCAST, (payload: any) => {
    // TODO check if you have to reply
    const recruitmentAcceptPayload = {
      masterId: payload.masterId,
      masterRole: payload.masterRole,
      operationId: payload.operationId,
      slaveId: myId,
    };
    socket.emit(
      BrokerServiceChannels.RECRUITMENT_ACCEPT,
      recruitmentAcceptPayload
    );
  });

  // REQUEST_CONNECTION handler
  socket.on(BrokerServiceChannels.REQUEST_CONNECTION, (payload: any) => {
    onRequestConnectionHandler(
      payload,
      (iceCandidatePayload: any) => {
        socket.emit(BrokerServiceChannels.ICE_CANDIDATE, iceCandidatePayload);
      },
      () => MastersHub.remove(payload.masterId)
    ).then((masterP2PConnection: MasterP2PConnection) => {
      MastersHub.add(masterP2PConnection);
      payload.sdp = masterP2PConnection.answer;
      socket.emit(BrokerServiceChannels.ANSWER_CONNECTION, payload);
    });
  });

  // ICE_CANDIDATE handler
  socket.on(BrokerServiceChannels.ICE_CANDIDATE, (payload: any) => {
    if (payload.candidate !== undefined) {
      const masterP2P = MastersHub.getByMasterId(payload.fromId);
      if (masterP2P !== undefined) {
        masterP2P.setIceCandidate(payload.candidate);
      } else {
        const slaveP2P = SlavesHub.getBySlaveId(payload.fromId);
        if (slaveP2P !== undefined) {
          slaveP2P.setIceCandidate(payload.candidate);
        }
      }
    }
  });
}
