import MasterP2PConnection from '../connections/MasterP2PConnection';
import P2PConnectionBuilder from './P2PConnectionBuilder';

export default interface MasterP2PConnectionBuilder
  extends P2PConnectionBuilder {
  build(): MasterP2PConnection;
}
