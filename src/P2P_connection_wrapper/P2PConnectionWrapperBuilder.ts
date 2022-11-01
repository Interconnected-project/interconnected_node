export default interface P2PConnectionWrapperBuilder {
  setOnIceCandidateHandler(
    onIceCandidateHandler: (candidate: any) => void
  ): P2PConnectionWrapperBuilder;

  setOnMessageHandler(
    onMessageHandler: (msg: any) => void
  ): P2PConnectionWrapperBuilder;
}
