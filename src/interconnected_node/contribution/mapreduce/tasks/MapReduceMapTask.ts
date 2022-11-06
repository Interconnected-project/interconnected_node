import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Task from '../../common/Task';

export default class MapReduceMapTask implements Task {
  private regionId: string;
  private splitsTotal: number;
  private splits: Object[];

  constructor(params: any) {
    this.regionId = params.regionId;
    this.splitsTotal = params.splitsTotal;
    this.splits = params.splits;
  }

  execute(
    jobParams: any,
    onCompletionCallback: () => void,
    onErrorCallback: () => void
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      try {
        const slaveP2PConnection: SlaveP2PConnection =
          jobParams.slaveP2PConnection;
        const mapFunction = eval(jobParams.mapFunction);
        const intermediateResults = this.splits.map((s) => {
          return mapFunction(s);
        });
        slaveP2PConnection.sendMessage(
          JSON.stringify({
            channel: 'TASK_COMPLETED',
            payload: {
              name: 'MAPREDUCE_MAP',
              params: {
                regionId: this.regionId,
                splitsTotal: this.splitsTotal,
                intermediateResults: intermediateResults,
              },
            },
          })
        );
        onCompletionCallback();
        resolve();
      } catch {
        onErrorCallback();
        resolve();
      }
    });
  }
}
