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

  applyOnRequestConnectionHandler(
    brokerServiceSocket,
    interconnectedNodeId,
    slaveP2PConnectionsHub,
    builders
  );

  applyOnIceCandidateHandler(
    brokerServiceSocket,
    interconnectedNodeId,
    slaveP2PConnectionsHub,
    masterP2PConnectionsHub
  );

  // TODO missing master-side handlers
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
      } else {
        brokerServiceSocket.emit(
          BrokerServiceChannels.RECRUITMENT_ACCEPT,
          'ERROR'
        );
      }
    }
  );
}

function applyOnRequestConnectionHandler(
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
          const offer = await slaveP2PConnection.createOffer();
          await slaveP2PConnection.setLocalDescription(offer);
          await slaveP2PConnection.setRemoteDescription(payload.sdp);
          payload.sdp = offer;
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

function applyOnIceCandidateHandler(
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
