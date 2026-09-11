export const ANTI_MODE_MESSAGE_PREFIX = 'anti-mode/';
export const INCOGNITO_MESSAGE_PREFIX = 'incognito/';

export const ANTI_MODE_MESSAGE_TYPE = {
  list: `${ANTI_MODE_MESSAGE_PREFIX}list`,
  activate: `${ANTI_MODE_MESSAGE_PREFIX}activate`,
  deactivate: `${ANTI_MODE_MESSAGE_PREFIX}deactivate`,
  addDomain: `${ANTI_MODE_MESSAGE_PREFIX}add-domain`,
  grantAccess: `${ANTI_MODE_MESSAGE_PREFIX}grant-access`,
} as const;

export const INCOGNITO_MESSAGE_TYPE = {
  status: `${INCOGNITO_MESSAGE_PREFIX}status`,
  openSettings: `${INCOGNITO_MESSAGE_PREFIX}open-settings`,
  setControl: `${INCOGNITO_MESSAGE_PREFIX}set-control`,
  suspend: `${INCOGNITO_MESSAGE_PREFIX}suspend`,
} as const;
