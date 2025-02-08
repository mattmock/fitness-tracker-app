type MockDataLevel = 'empty' | 'minimal' | 'full';

export class ConfigService {
  private static _mockDataLevel: MockDataLevel = 'full';
  private static _useMocks: boolean = true;

  static get useMocks(): boolean {
    return this._useMocks;
  }

  static get mockDataLevel(): MockDataLevel {
    return this._mockDataLevel;
  }

  static setMockDataLevel(level: MockDataLevel) {
    console.log('Setting mock data level to:', level);
    this._mockDataLevel = level;
  }

  static setUseMocks(useMocks: boolean) {
    this._useMocks = useMocks;
  }
} 