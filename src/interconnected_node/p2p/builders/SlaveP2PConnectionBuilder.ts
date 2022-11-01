import SlaveP2PConnection from '../connections/SlaveP2PConnection';

export default interface SlaveP2PConnectionBuilder {
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
