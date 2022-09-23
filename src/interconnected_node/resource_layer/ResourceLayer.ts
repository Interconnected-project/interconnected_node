import FabricLayer from '../fabric_layer/FabricLayer';
import ConnectivityLayer from '../connectivity_layer/ConnectivityLayer';
import ClientNodeOperations from './client_node_operations/ClientNodeOperations';
import P2POperations from './p2p_operations/P2POperations';

export default class ResourceLayer {
  private _clientNodeOperations: ClientNodeOperations =
    new ClientNodeOperations();
  private _p2pOperations: P2POperations = new P2POperations();

  constructor(
    private fabricLayer: FabricLayer,
    private connectivityLayer: ConnectivityLayer
  ) {}

  public get clientNodeOperations(): ClientNodeOperations {
    return this._clientNodeOperations;
  }

  public get p2pOperations(): P2POperations {
    return this._p2pOperations;
  }
}
