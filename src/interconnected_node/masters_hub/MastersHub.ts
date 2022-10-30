import MasterP2PConnection from './MasterP2PConnection';

export default class MastersHub {
  private static masters: MasterP2PConnection[] = [];

  private constructor() {
    // does nothing
  }

  public static get isEmpty(): boolean {
    return MastersHub.masters.length === 0;
  }

  public static getByMasterId(
    masterId: string
  ): MasterP2PConnection | undefined {
    return MastersHub.masters.find((m) => {
      return m.masterId === masterId;
    });
  }

  public static getByOperationId(
    operationId: string
  ): MasterP2PConnection | undefined {
    return MastersHub.masters.find((m) => {
      return m.operationId === operationId;
    });
  }

  public static add(masterP2PConnection: MasterP2PConnection): boolean {
    if (
      MastersHub.getByMasterId(masterP2PConnection.masterId) === undefined &&
      MastersHub.getByOperationId(masterP2PConnection.operationId) === undefined
    ) {
      MastersHub.masters.push(masterP2PConnection);
      return true;
    }
    return false;
  }

  public static remove(masterId: string): MasterP2PConnection | undefined {
    const m = MastersHub.getByMasterId(masterId);
    if (m !== undefined) {
      MastersHub.masters.splice(MastersHub.masters.indexOf(m), 1);
    }
    return m;
  }

  public static flush(): MasterP2PConnection[] {
    const copy = MastersHub.masters;
    MastersHub.masters = [];
    return copy;
  }
}
