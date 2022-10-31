import SlaveP2PConnection from './SlaveP2PConnection';

export default class SlavesHub {
  private static slaves: SlaveP2PConnection[] = [];

  private constructor() {
    // does nothing
  }

  public static get isEmpty(): boolean {
    return SlavesHub.slaves.length === 0;
  }

  public static getBySlaveId(slaveId: string): SlaveP2PConnection | undefined {
    return SlavesHub.slaves.find((s) => {
      return s.slaveId === slaveId;
    });
  }

  public static getByOperationId(
    operationId: string
  ): SlaveP2PConnection | undefined {
    return SlavesHub.slaves.find((s) => {
      return s.operationId === operationId;
    });
  }

  public static add(slaveP2PConnection: SlaveP2PConnection): boolean {
    if (
      SlavesHub.getBySlaveId(slaveP2PConnection.slaveId) === undefined &&
      SlavesHub.getByOperationId(slaveP2PConnection.operationId) === undefined
    ) {
      SlavesHub.slaves.push(slaveP2PConnection);
      return true;
    }
    return false;
  }

  public static remove(slaveId: string): SlaveP2PConnection | undefined {
    const s = SlavesHub.getBySlaveId(slaveId);
    if (s !== undefined) {
      SlavesHub.slaves.splice(SlavesHub.slaves.indexOf(s), 1);
    }
    return s;
  }

  public static flush(): SlaveP2PConnection[] {
    const copy = SlavesHub.slaves;
    SlavesHub.slaves = [];
    return copy;
  }
}
