import {
  completeFollowUpRecord,
  findFollowUp,
  listFollowUps as listFollowUpRecords,
  rescheduleFollowUpRecord,
} from './followUps.repository.js';

export function listFollowUps(user, filters) {
  return listFollowUpRecords(user, filters);
}

export function getFollowUp(user, id) {
  return findFollowUp(user, id);
}

export function completeFollowUp(user, id, input) {
  return completeFollowUpRecord(user, id, input);
}

export function rescheduleFollowUp(user, id, input) {
  return rescheduleFollowUpRecord(user, id, input);
}