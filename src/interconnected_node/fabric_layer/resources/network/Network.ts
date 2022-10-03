import { ConnectionMedium } from './ConnectionMedium';
import { NetworkMetrics } from './NetworkMetrics';

export class Network {
  private _connectionMedium: ConnectionMedium;
  private _networkMetrics: NetworkMetrics;

  constructor(
    connectionMedium: ConnectionMedium,
    networkMetrics: NetworkMetrics
  ) {
    this._connectionMedium = connectionMedium;
    this._networkMetrics = networkMetrics;
  }

  get connectionMedium(): ConnectionMedium {
    return this._connectionMedium;
  }

  get networkMetrics(): NetworkMetrics {
    return this._networkMetrics;
  }
}
