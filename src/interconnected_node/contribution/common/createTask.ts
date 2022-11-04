import MapReduceRegionSplitsTask from '../mapreduce/tasks/MapReduceRegionSplitsTask';
import Task from './Task';

export default function createTask(payload: any): Task {
  switch (payload.name) {
    case 'MAPREDUCE_REGION_SPLITS':
      return new MapReduceRegionSplitsTask(payload.params);
    default:
      throw new Error(
        'Unrecognized task name in received EXECUTE_TASK message'
      );
  }
}
