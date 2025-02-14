import { useCallback, useEffect, useState } from 'react';
import { ConfigService } from './ConfigService';
import type { AppConfig } from './types';

/**
 * Hook for accessing and modifying application configuration
 */
export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(() => 
    ConfigService.getInstance().getConfig()
  );

  useEffect(() => {
    // Subscribe to config changes
    const unsubscribe = ConfigService.getInstance().addChangeListener(() => {
      setConfig(ConfigService.getInstance().getConfig());
    });

    return unsubscribe;
  }, []);

  const updateConfig = useCallback(async (updates: Partial<AppConfig>) => {
    await ConfigService.getInstance().updateConfig(updates);
  }, []);

  const resetToDefaults = useCallback(async () => {
    await ConfigService.getInstance().resetToDefaults();
  }, []);

  return {
    config,
    updateConfig,
    resetToDefaults
  };
} 