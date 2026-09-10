export interface ReflectionsRepository {
  getEnabled(): Promise<boolean>;
  setEnabled(enabled: boolean): Promise<void>;
}
