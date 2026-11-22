"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { type SiteSettings } from "@/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import { fetchSiteSettings } from "@/lib/api";

interface SiteSettingsContextValue {
  settings: SiteSettings;
  isLoaded: boolean;
  refreshSettings: () => Promise<void>;
  setSettingsLocally: (next: SiteSettings) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue>({
  settings: DEFAULT_SITE_SETTINGS,
  isLoaded: false,
  refreshSettings: async () => {},
  setSettingsLocally: () => {},
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshSettings = useCallback(async () => {
    try {
      const live = await fetchSiteSettings();
      setSettings(live);
    } catch {
      // Gracefully keep defaults when backend is offline or during static preview
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchSiteSettings()
      .then((live) => {
        if (active) setSettings(live);
      })
      .catch(() => {
        // Gracefully keep defaults when backend is offline or during static preview
      })
      .finally(() => {
        if (active) setIsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const setSettingsLocally = useCallback((next: SiteSettings) => {
    setSettings(next);
  }, []);

  return (
    <SiteSettingsContext.Provider
      value={{ settings, isLoaded, refreshSettings, setSettingsLocally }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
