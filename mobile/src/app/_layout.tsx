import { Tabs } from "expo-router";
import { useState } from "react";

import {
  LanguageProvider,
  useLanguage,
} from "../i18n/LanguageContext";

function AppTabs() {
  const { t } = useLanguage();

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: t.home }}
      />

      <Tabs.Screen
        name="map"
        options={{ title: t.map }}
      />

      <Tabs.Screen
        name="chat"
        options={{ title: t.chat }}
      />

      <Tabs.Screen
        name="settings"
        options={{ title: t.settings }}
      />

      <Tabs.Screen
        name="profile"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="language"
        options={{ href: null }}
      />
    </Tabs>
  );
}

function AppContent() {
  const [languageSelected, setLanguageSelected] =
    useState(false);

  if (!languageSelected) {
    return (
      <LanguageScreen
        onLanguageSelected={() =>
          setLanguageSelected(true)
        }
      />
    );
  }

  return <AppTabs />;
}

function LanguageScreen({
  onLanguageSelected,
}: {
  onLanguageSelected: () => void;
}) {
  const Screen = require("./language").default;

  return (
    <Screen
      onLanguageSelected={onLanguageSelected}
    />
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}