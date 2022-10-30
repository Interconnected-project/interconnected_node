import ConnectionHub from './connection_hub/ConnectionHub';

export default class ConnectivityLayer {
  private _connectionHub: ConnectionHub = new ConnectionHub();

  constructor() {}

  public get connectionHub(): ConnectionHub {
    return this._connectionHub;
  }
}
