import Task from './Task';
import MapReduceMapTask from '../mapreduce/tasks/MapReduceMapTask';
import MapReduceRegionSplitsTask from '../mapreduce/tasks/MapReduceRegionSplitsTask';
import MapReduceReduceTask from '../mapreduce/tasks/MapReduceReduceTask';

export default function createTask(payload: any): Task {
  switch (payload.name) {
    case 'MAPREDUCE_REGION_SPLITS':
      return new MapReduceRegionSplitsTask(payload.params);
    case 'MAPREDUCE_MAP':
      return new MapReduceMapTask(payload.params);
    case 'MAPREDUCE_REDUCE':
      return new MapReduceReduceTask(payload.params);
    default:
      throw new Error(
        'Unrecognized task name in received EXECUTE_TASK message'
      );
  }
}
