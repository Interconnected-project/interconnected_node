import Job from './Job';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default interface MasterP2PConnection {
  get operationId(): string;

  get masterId(): string;

  get masterRole(): string;

  get answer(): any;

  setIceCandidate(candidate: any): void;

  sendP2PMessage(msg: any): void;

  setJob(job: Job): void;

  get job(): Job | undefined;

  disconnect(): void;
}
