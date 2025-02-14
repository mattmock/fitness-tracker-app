import { USE_MOCKS } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppConfig, ConfigChangeListener } from './types';
import { DEFAULT_CONFIG } from './types';

const CONFIG_STORAGE_KEY = '@app_config';

/**
 * Service for managing application configuration
 */
export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;
  private listeners: Set<ConfigChangeListener>;

  private constructor() {
    this.config = { 
      ...DEFAULT_CONFIG, 
      useMocks: USE_MOCKS === 'true' || USE_MOCKS === '1' 
    };
    this.listeners = new Set();
    this.loadConfig().catch(console.error);
  }

  /**
   * Get the singleton instance of ConfigService
   */
  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Add a listener for configuration changes
   */
  addChangeListener(listener: ConfigChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get the current configuration
   */
  getConfig(): AppConfig {
    return { ...this.config };
  }

  /**
   * Update configuration values
   */
  async updateConfig(updates: Partial<AppConfig>): Promise<void> {
    this.config = {
      ...this.config,
      ...updates,
      // Always use environment value for mocks
      useMocks: USE_MOCKS === 'true' || USE_MOCKS === '1'
    };
    await this.saveConfig();
    this.notifyListeners();
  }

  /**
   * Reset configuration to defaults
   */
  async resetToDefaults(): Promise<void> {
    this.config = { 
      ...DEFAULT_CONFIG, 
      useMocks: USE_MOCKS === 'true' || USE_MOCKS === '1' 
    };
    await this.saveConfig();
    this.notifyListeners();
  }

  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<AppConfig>;
        this.config = {
          ...DEFAULT_CONFIG,
          ...parsed,
          // Always use environment value for mocks
          useMocks: USE_MOCKS === 'true' || USE_MOCKS === '1'
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  /**
   * Save configuration to storage
   */
  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in config change listener:', error);
      }
    });
  }
} 