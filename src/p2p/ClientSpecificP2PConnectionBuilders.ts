import MasterP2PConnectionBuilder from './builders/MasterP2PConnectionBuilder';
import SlaveP2PConnectionBuilder from './builders/SlaveP2PConnectionBuilder';

export default interface ClientSpecificP2PConnectionBuilders {
  createNewMasterP2PConnectionBuilder(): MasterP2PConnectionBuilder;

  createNewSlaveP2PConnectionBuilder(): SlaveP2PConnectionBuilder;
}
