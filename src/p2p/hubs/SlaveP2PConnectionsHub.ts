import SlaveP2PConnection from '../connections/SlaveP2PConnection';

export default class SlaveP2PConnectionsHub {
  private connections: Array<SlaveP2PConnection>;

  constructor() {
    this.connections = new Array();
  }

  getByMasterId(id: string): SlaveP2PConnection | undefined {
    return this.connections.find((c) => {
      return c.masterId === id;
    });
  }

  getByOperationId(id: string): Array<SlaveP2PConnection> {
    return this.connections.filter((c) => {
      return c.operationId === id;
    });
  }

  getByMasterRole(role: string): Array<SlaveP2PConnection> {
    return this.connections.filter((c) => {
      return c.masterRole === role;
    });
  }

  add(conenction: SlaveP2PConnection): boolean {
    const notPresent =
      this.connections.find((c) => c.masterId === conenction.masterId) ===
      undefined;
    if (notPresent) {
      this.connections.push(conenction);
      return true;
    }
    return false;
  }

  removeByMasterId(id: string): SlaveP2PConnection | undefined {
    try {
      const toRemove = this.getByMasterId(id);
      if (toRemove !== undefined) {
        this.connections.splice(this.connections.indexOf(toRemove), 1);
      }
      return toRemove;
    } catch {
      return undefined;
    }
  }

  removeByOperationId(id: string): Array<SlaveP2PConnection> {
    const result = this.connections.filter((c) => {
      return c.operationId === id;
    });
    this.connections = this.connections.filter((c) => {
      return c.operationId !== id;
    });
    return result;
  }

  removeByMasterRole(role: string): Array<SlaveP2PConnection> {
    const result = this.connections.filter((c) => {
      return c.masterRole === role;
    });
    this.connections = this.connections.filter((c) => {
      return c.masterRole !== role;
    });
    return result;
  }

  flush(): Array<SlaveP2PConnection> {
    const copy = this.connections;
    this.connections = new Array();
    return copy;
  }
}
