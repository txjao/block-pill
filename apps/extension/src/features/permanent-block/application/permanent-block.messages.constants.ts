export const PERMANENT_BLOCK_MESSAGE_PREFIX = 'permanent-block/';

export const PERMANENT_BLOCK_MESSAGE_TYPE = {
  list: `${PERMANENT_BLOCK_MESSAGE_PREFIX}list`,
  add: `${PERMANENT_BLOCK_MESSAGE_PREFIX}add`,
} as const;
