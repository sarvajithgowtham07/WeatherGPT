import { Tabs, router } from "expo-router";
import { useEffect, useState } from "react";
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Always show language selection when the app starts.
    router.replace("/language");
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  return <AppTabs />;
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}