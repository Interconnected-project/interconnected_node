import SlaveP2PConnection from '../connections/SlaveP2PConnection';
import P2PConnectionBuilder from './P2PConnectionBuilder';

export default interface SlaveP2PConnectionBuilder
  extends P2PConnectionBuilder {
  build(): SlaveP2PConnection;
}
