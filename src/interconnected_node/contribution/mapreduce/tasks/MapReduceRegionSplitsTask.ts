import MasterP2PConnection from '../../../p2p/connections/MasterP2PConnection';
import Task from '../../common/Task';

export default class MapReduceRegionSplitsTask implements Task {
  private regionId: string;
  private splits: object[];

  constructor(taskParams: any) {
    this.regionId = taskParams.regionId;
    this.splits = taskParams.splits;
  }

  execute(
    jobParams: any,
    onCompletionCallback: () => void,
    onErrorCallback: () => void
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      try {
        const mapWorkers: MasterP2PConnection[] = jobParams.mapWorkers;
        const roundedUpSplitsPerWorker = Math.ceil(
          this.splits.length / mapWorkers.length
        );
        let currentSplitIndex = 0;
        let currentMWIndex = Math.floor(Math.random() * mapWorkers.length);
        for (
          let servedMWs = 0;
          servedMWs < mapWorkers.length &&
          currentSplitIndex < this.splits.length;
          ++servedMWs
        ) {
          const mw = mapWorkers[currentMWIndex];
          let splitsToSendNumber = roundedUpSplitsPerWorker;
          const remainingSplitsNumber = this.splits.length - currentSplitIndex;
          if (remainingSplitsNumber < roundedUpSplitsPerWorker) {
            splitsToSendNumber = remainingSplitsNumber;
          }
          const splitsToSend = this.splits.slice(
            currentSplitIndex,
            currentSplitIndex + splitsToSendNumber
          );
          mw.sendMessage(
            JSON.stringify({
              channel: 'EXECUTE_TASK',
              payload: {
                name: 'MAPREDUCE_MAP',
                params: {
                  regionId: this.regionId,
                  splitsTotal: this.splits.length,
                  splits: splitsToSend,
                },
              },
            })
          );
          if (++currentMWIndex === mapWorkers.length) {
            currentMWIndex = 0;
          }
          currentSplitIndex += splitsToSendNumber;
        }
        onCompletionCallback();
      } catch {
        onErrorCallback();
        resolve();
      }
    });
  }
}
