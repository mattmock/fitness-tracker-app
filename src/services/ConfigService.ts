import { USE_MOCKS } from '@env';

export class ConfigService {
  static get useMocks(): boolean {
    return USE_MOCKS?.toLowerCase() === 'true';
  }
} 