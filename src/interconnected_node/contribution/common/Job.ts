import Task from './Task';

export default interface Job {
  get operationId(): string;

  start(): Promise<void>;

  stop(): Promise<void>;

  enqueueTask(task: Task): Promise<boolean>;

  suppressTask(id: string): Promise<void>;
}
