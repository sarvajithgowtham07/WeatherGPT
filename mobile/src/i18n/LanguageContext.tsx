import React, {
  createContext,
  useContext,
  useState,
} from "react";

import {
  Language,
  getTranslations,
} from "./translations";

type LanguageContextType = {
  language: Language;

  setLanguage: (
    language: Language
  ) => Promise<void>;

  t: ReturnType<typeof getTranslations>;
};

const LanguageContext =
  createContext<
    LanguageContextType | undefined
  >(undefined);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // English is the default language.
  // User must still press Continue
  // on the language selection screen.
  const [language, setLanguageState] =
    useState<Language>("English");

  const setLanguage = async (
    newLanguage: Language
  ) => {
    setLanguageState(newLanguage);
  };

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}