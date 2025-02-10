interface MockConfig {
  sessionCount: number;
  exerciseCount: number;
  routineCount: number;
}

const DEFAULT_CONFIG: MockConfig = {
  sessionCount: 3,
  exerciseCount: 5,
  routineCount: 3,
};

type ConfigChangeListener = () => void;

export class ConfigService {
  private static config: MockConfig = { ...DEFAULT_CONFIG };
  private static listeners: Set<ConfigChangeListener> = new Set();
  private static _useMocks: boolean = true;

  static get useMocks(): boolean {
    return this._useMocks;
  }

  static setUseMocks(value: boolean) {
    this._useMocks = value;
    this.notifyListeners();
  }

  static get sessionCount(): number {
    return this.config.sessionCount;
  }

  static get exerciseCount(): number {
    return this.config.exerciseCount;
  }

  static get routineCount(): number {
    return this.config.routineCount;
  }

  static addChangeListener(listener: ConfigChangeListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  static setSessionCount(count: number) {
    this.config.sessionCount = Math.max(0, count);
    console.log('Session count updated:', this.config.sessionCount);
    this.notifyListeners();
  }

  static setExerciseCount(count: number) {
    this.config.exerciseCount = Math.max(0, count);
    console.log('Exercise count updated:', this.config.exerciseCount);
    this.notifyListeners();
  }

  static setRoutineCount(count: number) {
    this.config.routineCount = Math.max(0, count);
    console.log('Routine count updated:', this.config.routineCount);
    this.notifyListeners();
  }

  static resetToDefaults() {
    this.config = { ...DEFAULT_CONFIG };
    console.log('Config reset to defaults:', this.config);
    this.notifyListeners();
  }
} 