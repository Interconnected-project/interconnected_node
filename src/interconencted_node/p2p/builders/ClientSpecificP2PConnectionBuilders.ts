import MasterP2PConnectionBuilder from './MasterP2PConnectionBuilder';
import SlaveP2PConnectionBuilder from './SlaveP2PConnectionBuilder';

export default interface ClientSpecificP2PConnectionBuilders {
  createNewMasterP2PConnectionBuilder(): MasterP2PConnectionBuilder;

  createNewSlaveP2PConnectionBuilder(): SlaveP2PConnectionBuilder;
}
