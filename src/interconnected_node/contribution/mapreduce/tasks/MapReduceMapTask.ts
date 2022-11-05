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
    const mapFunction = jobParams.mapFunction;
    this.splits.forEach((s) => eval(mapFunction)(s));
    onCompletionCallback();
    return new Promise<void>((resolve) => resolve());
  }
}
