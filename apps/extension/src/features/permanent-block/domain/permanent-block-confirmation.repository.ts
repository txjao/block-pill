export interface PermanentBlockConfirmationRepository {
  getEnabled(): Promise<boolean>;
  setEnabled(enabled: boolean): Promise<void>;
}
