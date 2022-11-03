import Job from './Job';

export default class JobsRepository {
  private jobs: Array<Job> = new Array();

  add(job: Job): boolean {
    const isPresent =
      this.jobs.find((j) => j.operationId === job.operationId) !== undefined;
    if (isPresent) {
      return false;
    } else {
      this.jobs.push(job);
      return true;
    }
  }

  remove(operationId: string): Job | undefined {
    try {
      const res = this.get(operationId);
      if (res !== undefined) {
        this.jobs.splice(this.jobs.indexOf(res), 1);
      }
      return res;
    } catch {
      return undefined;
    }
  }

  get(operationId: string): Job | undefined {
    return this.jobs.find((j) => j.operationId === operationId);
  }

  get isContributing(): boolean {
    return this.jobs.length > 0;
  }
}
