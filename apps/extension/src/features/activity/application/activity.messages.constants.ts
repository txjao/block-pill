export const ACTIVITY_MESSAGE_PREFIX = 'activity/';

export const ACTIVITY_MESSAGE_TYPE = {
  list: `${ACTIVITY_MESSAGE_PREFIX}list`,
  record: `${ACTIVITY_MESSAGE_PREFIX}record`,
  remove: `${ACTIVITY_MESSAGE_PREFIX}remove`,
} as const;
