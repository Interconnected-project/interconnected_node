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
    throw new Error('Method not implemented.');
  }
}
