"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { memories } from "@/data/memories";
import { messages, type Locale } from "@/data/messages";

const STORAGE_KEY = "the-moment:locale";

const LocaleContext = createContext<{ locale: Locale; toggleLocale: () => void } | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "en") setLocale("en");
    } catch {
      // Storage can be blocked; Arabic stays the default.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    try {
      sessionStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Same as above.
    }
  }, [locale]);

  const value = useMemo(
    () => ({ locale, toggleLocale: () => setLocale((l) => (l === "ar" ? "en" : "ar")) }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}

/** All on-screen text for the current language. */
export function useMessages() {
  const { locale } = useLocale();
  return { ...messages[locale], frames: memories[locale], isRtl: locale === "ar" };
}
