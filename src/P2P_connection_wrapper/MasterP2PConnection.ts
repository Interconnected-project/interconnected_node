import P2PConnection from './P2PConnection';

//A P2P connection where my role is Master
export default interface MasterP2PConnection extends P2PConnection {
  get slaveId(): string;
}
