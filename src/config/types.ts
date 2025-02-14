/**
 * Configuration change listener function type
 */
export type ConfigChangeListener = () => void;

/**
 * Application configuration interface
 */
export interface AppConfig {
  useMocks: boolean;
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  theme: 'light' | 'dark' | 'system';
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: AppConfig = {
  useMocks: false,
  debugMode: false,
  logLevel: 'info',
  theme: 'system'
}; 