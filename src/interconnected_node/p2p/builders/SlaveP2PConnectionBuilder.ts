import SlaveP2PConnection from '../connections/SlaveP2PConnection';

export default interface SlaveP2PConnectionBuilder {
  setMasterId(masterId: string): SlaveP2PConnectionBuilder;

  setMasterRole(masterRole: string): SlaveP2PConnectionBuilder;

  setOperationId(operationId: string): SlaveP2PConnectionBuilder;

  setOnIceCandidateHandler(
    onIceCandidateHandler: (candidate: any) => void
  ): SlaveP2PConnectionBuilder;

  setOnMessageHandler(
    onMessageHandler: (msg: any) => void
  ): SlaveP2PConnectionBuilder;

  setOnDisconnectionHandler(
    onDisconnectionHandler: () => void
  ): SlaveP2PConnectionBuilder;

  build(): SlaveP2PConnection;
}
