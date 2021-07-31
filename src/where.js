import filter from 'lodash/filter';
import {matchesConditions} from './matches_conditions';

export function where(collection, conditions) {
  return filter(collection, (item) => matchesConditions(item, conditions));
}
