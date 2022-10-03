import { ExecutionEnvironment } from './ExecutionEnvironment';
import { TaskType } from './TaskType';

export class SupportedTask {
  private _taskType: TaskType;
  private _executionEnvironment: ExecutionEnvironment;

  constructor(taskType: TaskType, executionEnvironment: ExecutionEnvironment) {
    this._taskType = taskType;
    this._executionEnvironment = executionEnvironment;
  }

  get taskType(): TaskType {
    return this._taskType;
  }

  get executionEnvironment(): ExecutionEnvironment {
    return this._executionEnvironment;
  }
}
