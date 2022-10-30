import FabricLayer from '../fabric_layer/FabricLayer';
import ConnectionHub from './connection_hub/ConnectionHub';

export default class ConnectivityLayer {
  private _connectionHub: ConnectionHub = new ConnectionHub();

  constructor(private fabricLayer: FabricLayer) {}

  public get connectionHub(): ConnectionHub {
    return this._connectionHub;
  }
}
