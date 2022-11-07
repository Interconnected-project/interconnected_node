import SlaveP2PConnection from '../../../p2p/connections/SlaveP2PConnection';
import Task from '../../common/Task';

export default class MapReduceReduceTask implements Task {
  private regionId: string;
  private intermediateResult: Array<Array<any>>;

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
        const result = new Array();
        while (this.intermediateResult.length > 0) {
          const key = this.intermediateResult[0][0];
          const matchingKey = this.intermediateResult
            .filter((elem) => {
              return elem[0] === key;
            })
            .map((match) => {
              return match[1];
            });
          this.intermediateResult = this.intermediateResult.filter((elem) => {
            return elem[0] !== key;
          });
          var accumulator = matchingKey.pop();
          matchingKey.forEach(
            (e) => (accumulator = reduceFunction(accumulator, e))
          );
          result.push([key, accumulator]);
        }
        slaveP2PConnection.sendMessage(
          JSON.stringify({
            channel: 'TASK_COMPLETED',
            payload: {
              name: 'MAPREDUCE_REDUCE',
              params: {
                regionId: this.regionId,
                result: result,
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
