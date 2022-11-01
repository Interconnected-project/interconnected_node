import MasterP2PConnection from '../connections/MasterP2PConnection';

export default class MasterP2PConnectionsHub {
  private connections: Array<MasterP2PConnection>;

  constructor() {
    this.connections = new Array();
  }

  getBySlaveId(id: string): MasterP2PConnection | undefined {
    return this.connections.find((c) => {
      return c.slaveId === id;
    });
  }

  getByOperationId(id: string): Array<MasterP2PConnection> {
    return this.connections.filter((c) => {
      return c.operationId === id;
    });
  }

  add(connection: MasterP2PConnection): boolean {
    const notPresent =
      this.connections.find((c) => c.slaveId === connection.slaveId) ===
      undefined;
    if (notPresent) {
      this.connections.push(connection);
      return true;
    }
    return false;
  }

  removeByMasterId(id: string): MasterP2PConnection | undefined {
    try {
      const toRemove = this.getBySlaveId(id);
      if (toRemove !== undefined) {
        this.connections.splice(this.connections.indexOf(toRemove), 1);
      }
      return toRemove;
    } catch {
      return undefined;
    }
  }

  removeByOperationId(id: string): Array<MasterP2PConnection> {
    const result = this.connections.filter((c) => {
      return c.operationId === id;
    });
    this.connections = this.connections.filter((c) => {
      return c.operationId !== id;
    });
    return result;
  }

  flush(): Array<MasterP2PConnection> {
    const copy = this.connections;
    this.connections = new Array();
    return copy;
  }
}
