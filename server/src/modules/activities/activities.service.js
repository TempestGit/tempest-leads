import {
  findActivity,
  insertActivity,
  listActivities as listActivityRecords,
} from './activities.repository.js';

export function listActivities(user, filters) {
  return listActivityRecords(user, filters);
}

export function getActivity(user, id) {
  return findActivity(user, id);
}

export function createActivity(user, input) {
  return insertActivity(user, input);
}