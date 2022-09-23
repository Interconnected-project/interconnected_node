import AuthenticationManager from './authentication_manager/AuthenticationManager';
import ConnectionHub from './connection_hub/ConnectionHub';

export default class ConnectivityLayer {
  private _connectionHub: ConnectionHub;
  private _authenticationManager: AuthenticationManager;

  constructor() {
    this._connectionHub = new ConnectionHub();
    this._authenticationManager = new AuthenticationManager();
  }

  public get connectionHub(): ConnectionHub {
    return this._connectionHub;
  }

  public get authenticationManager(): AuthenticationManager {
    return this._authenticationManager;
  }
}
