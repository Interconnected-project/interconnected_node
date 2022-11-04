import Task from '../../common/Task';

export default class MapReduceMapTask implements Task {
  constructor(params: any) {
    //TODO implement
  }

  execute(
    jobParams: any,
    onCompletionCallback: () => void,
    onErrorCallback: () => void
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
