import FabricLayer from '../fabric_layer/FabricLayer';
import AuthenticationManager from './authentication_manager/AuthenticationManager';
import ConnectionHub from './connection_hub/ConnectionHub';

export default class ConnectivityLayer {
  private _connectionHub: ConnectionHub = new ConnectionHub();
  private _authenticationManager: AuthenticationManager =
    new AuthenticationManager();

  constructor(private fabricLayer: FabricLayer) {}

  public get connectionHub(): ConnectionHub {
    return this._connectionHub;
  }

  public get authenticationManager(): AuthenticationManager {
    return this._authenticationManager;
  }
}
