/* eslint-disable @typescript-eslint/no-explicit-any */
import { Socket } from 'socket.io-client';
import MapReduceMasterJob from '../masters_hub/MapReduceMasterJob';
import MasterP2PConnection from '../masters_hub/MasterP2PConnection';
import MastersHub from '../masters_hub/MastersHub';
import SlaveP2PConnection from '../slaves_hub/SlaveP2PConnection';
import SlavesHub from '../slaves_hub/SlavesHub';
import BrokerServiceChannels from './BrokerServiceChannels';

export default function applyBrokerServiceHandlers(
  socket: Socket,
  myId: string,
  onRecruitmentAcceptHandler: (
    payload: any,
    emitIceCandidateCallback: (payload: any) => void,
    disconnectionCallback: () => void
  ) => Promise<SlaveP2PConnection>,
  onRequestConnectionHandler: (
    payload: any,
    emitIceCandidateCallback: (payload: any) => void,
    onMasterP2PMessage: (
      msg: any,
      masterP2PConnection: MasterP2PConnection
    ) => void,
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
    // TODO requirements
    if (
      payload.masterId !== myId &&
      MastersHub.getByOperationId(payload.operationId) === undefined &&
      MastersHub.getByMasterId(payload.masterId) === undefined &&
      SlavesHub.getByOperationId(payload.operationId) === undefined &&
      SlavesHub.getBySlaveId(payload.masterId) === undefined
    ) {
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
    }
  });

  // RECRUITMENT_ACCEPT handler
  socket.on(BrokerServiceChannels.RECRUITMENT_ACCEPT, (payload: any) => {
    onRecruitmentAcceptHandler(
      payload,
      (iceCandidatePayload: any) => {
        socket.emit(BrokerServiceChannels.ICE_CANDIDATE, iceCandidatePayload);
      },
      () => SlavesHub.remove(payload.slaveId)
    ).then((slaveP2PConnection: SlaveP2PConnection) => {
      SlavesHub.add(slaveP2PConnection);
      payload.sdp = slaveP2PConnection.offer;
      socket.emit(BrokerServiceChannels.REQUEST_CONNECTION, payload);
    });
  });

  // REQUEST_CONNECTION handler
  socket.on(BrokerServiceChannels.REQUEST_CONNECTION, (payload: any) => {
    if (
      MastersHub.getByOperationId(payload.operationId) === undefined &&
      MastersHub.getByMasterId(payload.masterId) === undefined &&
      SlavesHub.getByOperationId(payload.operationId) === undefined &&
      SlavesHub.getBySlaveId(payload.masterId) === undefined
    ) {
      onRequestConnectionHandler(
        payload,
        (iceCandidatePayload: any) => {
          socket.emit(BrokerServiceChannels.ICE_CANDIDATE, iceCandidatePayload);
        },
        onMasterP2PMessage(socket),
        () => MastersHub.remove(payload.masterId)
      ).then((masterP2PConnection: MasterP2PConnection) => {
        MastersHub.add(masterP2PConnection);
        payload.sdp = masterP2PConnection.answer;
        socket.emit(BrokerServiceChannels.ANSWER_CONNECTION, payload);
      });
    }
  });

  // ANSWER_CONNECTION handler
  socket.on(BrokerServiceChannels.ANSWER_CONNECTION, (payload: any) => {
    const slaveConnection = SlavesHub.getBySlaveId(payload.slaveId);
    if (slaveConnection !== undefined) {
      slaveConnection.setAnswer(payload.sdp);
    }
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

function onStartJobMessage(
  payload: any,
  masterP2PConnection: MasterP2PConnection,
  brokerSocket: Socket
): void {
  switch (payload.name) {
    case 'MAPREDUCE_MASTER':
      masterP2PConnection.setJob(
        new MapReduceMasterJob(
          payload.params,
          masterP2PConnection,
          brokerSocket
        )
      );
      masterP2PConnection.job?.start();
      break;
    default:
      throw new Error('NO SUCH JOB HANDLER IMPLEMENTED: ' + payload.name);
  }
}

function onMasterP2PMessage(
  brokerSocket: Socket
): (msg: any, masterP2PConnection: MasterP2PConnection) => void {
  return (msg: any, masterP2PConnection: MasterP2PConnection): void => {
    const convertedMsg = JSON.parse(msg);
    switch (convertedMsg.channel) {
      case 'START_JOB':
        onStartJobMessage(
          convertedMsg.payload,
          masterP2PConnection,
          brokerSocket
        );
        break;
      default:
        throw new Error(
          'NO SUCH MESSAGE HANDLER IMPLEMENTED: ' + convertedMsg.channel
        );
    }
  };
}
