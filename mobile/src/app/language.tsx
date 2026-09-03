import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import { useState } from "react";

import {
  Language,
} from "../i18n/translations";

import { useLanguage } from "../i18n/LanguageContext";

const LANGUAGES: {
  key: Language;
  native: string;
}[] = [
  {
    key: "English",
    native: "English",
  },
  {
    key: "Hindi",
    native: "हिन्दी",
  },
  {
    key: "Telugu",
    native: "తెలుగు",
  },
  {
    key: "Tamil",
    native: "தமிழ்",
  },
  {
    key: "Kannada",
    native: "ಕನ್ನಡ",
  },
  {
    key: "Marathi",
    native: "मराठी",
  },
];

type LanguageScreenProps = {
  onLanguageSelected?: () => void;
};

export default function LanguageScreen({
  onLanguageSelected,
}: LanguageScreenProps) {
  const {
    setLanguage: changeLanguage,
  } = useLanguage();

  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>("English");

  const [saving, setSaving] =
    useState(false);

  const continueToApp = async () => {
    try {
      setSaving(true);

      // Change the app language immediately.
      await changeLanguage(selectedLanguage);

      // Tell _layout.tsx that language selection is complete.
      if (onLanguageSelected) {
        onLanguageSelected();
      }
    } catch (error) {
      console.error(
        "Language change error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to change language."
      );

      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>
          🌦️
        </Text>

        <Text style={styles.title}>
          WeatherGPT
        </Text>

        <Text style={styles.subtitle}>
          Choose your language
        </Text>

        <Text style={styles.subtitleNative}>
          अपनी भाषा चुनें
        </Text>

        <View style={styles.languageContainer}>
          {LANGUAGES.map((language) => {
            const selected =
              selectedLanguage === language.key;

            return (
              <Pressable
                key={language.key}
                style={[
                  styles.languageButton,
                  selected &&
                    styles.selectedLanguage,
                ]}
                onPress={() =>
                  setSelectedLanguage(
                    language.key
                  )
                }
                disabled={saving}
              >
                <Text style={styles.radio}>
                  {selected ? "◉" : "○"}
                </Text>

                <Text
                  style={[
                    styles.languageText,
                    selected &&
                      styles.selectedText,
                  ]}
                >
                  {language.native}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[
            styles.continueButton,
            saving &&
              styles.disabledButton,
          ]}
          onPress={continueToApp}
          disabled={saving}
        >
          <Text style={styles.continueText}>
            {saving
              ? "Opening..."
              : "Continue"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  logo: {
    fontSize: 55,
    textAlign: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 4,
  },

  subtitleNative: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 30,
  },

  languageContainer: {
    gap: 12,
  },

  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dddddd",
    backgroundColor: "#f8f8f8",
  },

  selectedLanguage: {
    borderColor: "#1683f7",
    backgroundColor: "#eaf4ff",
  },

  radio: {
    fontSize: 22,
    marginRight: 15,
  },

  languageText: {
    fontSize: 19,
  },

  selectedText: {
    fontWeight: "bold",
  },

  continueButton: {
    marginTop: 30,
    padding: 17,
    borderRadius: 14,
    backgroundColor: "#1683f7",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  continueText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});