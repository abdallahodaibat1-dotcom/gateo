'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AiWizardData,
  loadWizardData,
  saveWizardData,
  getDefaultWizardData,
} from '@/lib/ai-wizard/types';

export function useAiWizard() {
  const [data, setData] = useState<AiWizardData>(getDefaultWizardData());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadWizardData());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveWizardData(data);
    }
  }, [data, loaded]);

  const updateData = useCallback((updates: Partial<AiWizardData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateField = useCallback(<K extends keyof AiWizardData>(key: K, value: AiWizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    setData(getDefaultWizardData());
  }, []);

  return {
    data,
    loaded,
    updateData,
    updateField,
    reset,
  };
}
