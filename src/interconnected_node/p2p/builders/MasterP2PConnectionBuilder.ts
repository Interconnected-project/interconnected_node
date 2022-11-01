import MasterP2PConnection from '../connections/MasterP2PConnection';

export default interface MasterP2PConnectionBuilder {
  setOnIceCandidateHandler(
    onIceCandidateHandler: (candidate: any) => void
  ): MasterP2PConnectionBuilder;

  setOnMessageHandler(
    onMessageHandler: (msg: any) => void
  ): MasterP2PConnectionBuilder;

  setOnDisconnectionHandler(
    onDisconnectionHandler: () => void
  ): MasterP2PConnectionBuilder;

  build(): MasterP2PConnection;
}
