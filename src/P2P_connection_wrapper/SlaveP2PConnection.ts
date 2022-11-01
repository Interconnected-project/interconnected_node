import P2PConnectionWrapper from './P2PConnectionWrapper';

//A P2P connection where my role is Slave
export default interface SlaveP2PConnection extends P2PConnectionWrapper {
  get masterId(): string;

  get masterRole(): string;
}
