import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Task from '../../common/Task';

export default class MapReduceReduceTask implements Task {
  private regionId: string;
  private intermediateResult: Object[];

  constructor(params: any) {
    this.regionId = params.regionId;
    this.intermediateResult = params.intermediateResult;
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
        const reduceFunction = eval(jobParams.reduceFunction);
        console.log(this.intermediateResult);
        onCompletionCallback();
        resolve();
      } catch {
        onErrorCallback();
        resolve();
      }
    });
  }
}
