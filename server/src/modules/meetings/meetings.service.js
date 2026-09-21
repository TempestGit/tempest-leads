import {
  findMeeting,
  insertMeeting,
  listMeetings as listMeetingRecords,
} from './meetings.repository.js';

export function listMeetings(user, filters) {
  return listMeetingRecords(user, filters);
}

export function getMeeting(user, id) {
  return findMeeting(user, id);
}

export function createMeeting(user, input) {
  return insertMeeting(user, input);
}