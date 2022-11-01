import P2PConnection from './P2PConnection';

//A P2P connection where my role is Slave
export default interface SlaveP2PConnection extends P2PConnection {
  get masterId(): string;

  get masterRole(): string;

  createAnswer(): Promise<any>;
}
