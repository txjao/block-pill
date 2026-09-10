export const INTERFACE_PREVIEW_NAME = {
  popup: 'popup',
  settings: 'settings',
  blocked: 'blocked',
} as const;

export type InterfacePreviewName =
  (typeof INTERFACE_PREVIEW_NAME)[keyof typeof INTERFACE_PREVIEW_NAME];
