import { Tabs } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import {
  LanguageProvider,
  useLanguage,
} from "../i18n/LanguageContext";

function AppTabs() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        // Make sure icons have room to display
        tabBarShowLabel: true,
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: t.home,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "home"
                  : "home-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* DASHBOARD */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t.dashboard,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "grid"
                  : "grid-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* MAP */}
      <Tabs.Screen
        name="map"
        options={{
          title: t.map,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "map"
                  : "map-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* CHAT */}
      <Tabs.Screen
        name="chat"
        options={{
          title: t.chat,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "chatbubble"
                  : "chatbubble-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* SETTINGS */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t.settings,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={
                focused
                  ? "settings"
                  : "settings-outline"
              }
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE - HIDDEN */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />

      {/* LANGUAGE - HIDDEN */}
      <Tabs.Screen
        name="language"
        options={{
          href: null,
        }}
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