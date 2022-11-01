export default interface P2PConnectionBuilder {
  setOnIceCandidateHandler(
    onIceCandidateHandler: (candidate: any) => void
  ): P2PConnectionBuilder;

  setOnMessageHandler(
    onMessageHandler: (msg: any) => void
  ): P2PConnectionBuilder;
}
