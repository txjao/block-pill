export const STANDARD_BLOCK_MESSAGE_PREFIX = 'standard-blocking/';

export const STANDARD_BLOCK_MESSAGE_TYPE = {
  list: `${STANDARD_BLOCK_MESSAGE_PREFIX}list`,
  add: `${STANDARD_BLOCK_MESSAGE_PREFIX}add`,
  remove: `${STANDARD_BLOCK_MESSAGE_PREFIX}remove`,
  status: `${STANDARD_BLOCK_MESSAGE_PREFIX}status`,
  context: `${STANDARD_BLOCK_MESSAGE_PREFIX}context`,
  requestAccess: `${STANDARD_BLOCK_MESSAGE_PREFIX}request-access`,
  settings: `${STANDARD_BLOCK_MESSAGE_PREFIX}settings`,
  updateSettings: `${STANDARD_BLOCK_MESSAGE_PREFIX}update-settings`,
  updateDomainCooldown: `${STANDARD_BLOCK_MESSAGE_PREFIX}update-domain-cooldown`,
  addSubdomainException: `${STANDARD_BLOCK_MESSAGE_PREFIX}add-subdomain-exception`,
} as const;
