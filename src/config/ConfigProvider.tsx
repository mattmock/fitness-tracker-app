import React, { createContext, useContext } from 'react';
import { useConfig } from './hooks';
import type { AppConfig } from './types';

interface ConfigContextValue {
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
}

interface ConfigProviderProps {
  children: React.ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const configValue = useConfig();

  return (
    <ConfigContext.Provider value={configValue}>
      {children}
    </ConfigContext.Provider>
  );
} 