/* eslint-disable @typescript-eslint/no-explicit-any */
export default interface MasterP2PConnection {
  get operationId(): string;

  get slaveId(): string;

  get offer(): any;

  setAnswer(answer: any): void;

  setIceCandidate(candidate: any): void;

  disconnect(): void;
}
