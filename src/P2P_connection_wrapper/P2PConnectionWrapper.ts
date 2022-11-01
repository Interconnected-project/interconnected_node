export default interface P2PConnectionWrapper {
  createOffer(): Promise<any>;

  setLocalDescription(sdp: any): Promise<void>;

  get localDescription(): any | undefined;

  setRemoteDescription(sdp: any): Promise<void>;

  get remoteDescription(): any | undefined;

  addIceCandidate(candidate: any): Promise<void>;

  sendMessage(msg: any): void;
}