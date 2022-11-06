import Task from '../../common/Task';

export default class MapReduceMapTask implements Task {
  private regionId: string;
  private splits: Object[];

  constructor(params: any) {
    this.regionId = params.regionId;
    this.splits = params.splits;
  }

  execute(
    jobParams: any,
    onCompletionCallback: () => void,
    onErrorCallback: () => void
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const mapFunction = eval(jobParams.mapFunction);
      const intermediateResults = this.splits.map((s) => {
        return mapFunction(s);
      });
      console.log(intermediateResults);
      onCompletionCallback();
      resolve();
    });
  }
}
