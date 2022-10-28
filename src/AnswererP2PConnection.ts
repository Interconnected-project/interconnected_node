/* eslint-disable @typescript-eslint/no-explicit-any */
export default interface AnswererP2PConnection {
  get myId(): string;

  get initiatorId(): string;

  get initiatorRole(): string;

  get answer(): any;

  setIceCandidate(candidate: any): void;
}
