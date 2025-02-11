import { USE_MOCKS } from '@env';

type ConfigChangeListener = () => void;

export class ConfigService {
  private static listeners: Set<ConfigChangeListener> = new Set();

  static addChangeListener(listener: ConfigChangeListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  static resetToDefaults() {
    console.log('Config reset to defaults');
    this.notifyListeners();
  }
} 