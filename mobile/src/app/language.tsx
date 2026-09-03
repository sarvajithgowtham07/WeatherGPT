import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import { useState } from "react";
import * as Speech from "expo-speech";

import { Language } from "../i18n/translations";
import { useLanguage } from "../i18n/LanguageContext";
import { updateUser } from "../api/api";

const USER_ID = 2;

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

// ======================================
// LANGUAGE VOICE + ALERT TEXT
// ======================================

const LANGUAGE_MESSAGES: Record<
  Language,
  {
    title: string;
    message: string;
    cancel: string;
    continue: string;
    speechLanguage: string;
  }
> = {
  English: {
    title: "Language Selection",
    message:
      "You are going to select English language.",
    cancel: "Cancel",
    continue: "Continue",
    speechLanguage: "en-IN",
  },

  Hindi: {
    title: "भाषा चयन",
    message:
      "आप हिंदी भाषा चुनने जा रहे हैं।",
    cancel: "रद्द करें",
    continue: "जारी रखें",
    speechLanguage: "hi-IN",
  },

  Telugu: {
    title: "భాష ఎంపిక",
    message:
      "మీరు తెలుగు భాషను ఎంచుకోబోతున్నారు.",
    cancel: "రద్దు",
    continue: "కొనసాగించు",
    speechLanguage: "te-IN",
  },

  Tamil: {
    title: "மொழி தேர்வு",
    message:
      "நீங்கள் தமிழ் மொழியைத் தேர்ந்தெடுக்க உள்ளீர்கள்.",
    cancel: "ரத்து",
    continue: "தொடரவும்",
    speechLanguage: "ta-IN",
  },

  Kannada: {
    title: "ಭಾಷೆ ಆಯ್ಕೆ",
    message:
      "ನೀವು ಕನ್ನಡ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಲಿದ್ದೀರಿ.",
    cancel: "ರದ್ದು",
    continue: "ಮುಂದುವರಿಸಿ",
    speechLanguage: "kn-IN",
  },

  Marathi: {
    title: "भाषा निवड",
    message:
      "तुम्ही मराठी भाषा निवडणार आहात.",
    cancel: "रद्द करा",
    continue: "पुढे जा",
    speechLanguage: "mr-IN",
  },
};

export default function LanguageScreen({
  onLanguageSelected,
}: LanguageScreenProps) {
  const {
    language,
    setLanguage: changeLanguage,
    t,
  } = useLanguage();

  // Current language is selected by default.
  const [
    selectedLanguage,
    setSelectedLanguage,
  ] = useState<Language>(language);

  const [saving, setSaving] =
    useState(false);

  // ======================================
  // SELECT LANGUAGE
  // ======================================

  function handleLanguageSelect(
    newLanguage: Language
  ) {
    const selected =
      LANGUAGE_MESSAGES[newLanguage];

    // Stop any previous voice
    Speech.stop();

    // Speak confirmation in selected language
    Speech.speak(
      selected.message,
      {
        language:
          selected.speechLanguage,
        rate: 0.85,
      }
    );

    // Show confirmation alert
    Alert.alert(
      selected.title,
      selected.message,
      [
        {
          text: selected.cancel,
          style: "cancel",
          onPress: () => {
            Speech.stop();
          },
        },

        {
          text: selected.continue,
          onPress: () => {
            Speech.stop();

            // Only select after confirmation
            setSelectedLanguage(
              newLanguage
            );
          },
        },
      ]
    );
  }

  // ======================================
  // CONTINUE
  // ======================================

  async function continueToApp() {
    try {
      setSaving(true);

      // ----------------------------------
      // 1. Save language to backend
      // ----------------------------------

      await updateUser(USER_ID, {
        language: selectedLanguage,
      });

      // ----------------------------------
      // 2. Change mobile app language
      // ----------------------------------

      await changeLanguage(
        selectedLanguage
      );

      // ----------------------------------
      // 3. Open the application
      // ----------------------------------

      if (onLanguageSelected) {
        onLanguageSelected();
      }
    } catch (error) {
      console.error(
        "Language update error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to save language. Please try again."
      );

      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* LOGO */}

        <Text style={styles.logo}>
          🌦️
        </Text>

        {/* TITLE */}

        <Text style={styles.title}>
          WeatherGPT
        </Text>

        {/* LANGUAGE INSTRUCTIONS */}

        <Text style={styles.subtitle}>
          {t.chooseLanguage}
        </Text>

        <Text
          style={styles.subtitleNative}
        >
          अपनी भाषा चुनें
        </Text>

        {/* LANGUAGE OPTIONS */}

        <View
          style={
            styles.languageContainer
          }
        >
          {LANGUAGES.map(
            (item) => {
              const selected =
                selectedLanguage ===
                item.key;

              return (
                <Pressable
                  key={item.key}
                  style={[
                    styles.languageButton,

                    selected &&
                      styles.selectedLanguage,
                  ]}
                  onPress={() =>
                    handleLanguageSelect(
                      item.key
                    )
                  }
                  disabled={saving}
                >
                  <Text
                    style={
                      styles.radio
                    }
                  >
                    {selected
                      ? "◉"
                      : "○"}
                  </Text>

                  <Text
                    style={[
                      styles.languageText,

                      selected &&
                        styles.selectedText,
                    ]}
                  >
                    {item.native}
                  </Text>
                </Pressable>
              );
            }
          )}
        </View>

        {/* CONTINUE */}

        <Pressable
          style={[
            styles.continueButton,

            saving &&
              styles.disabledButton,
          ]}
          onPress={
            continueToApp
          }
          disabled={saving}
        >
          <Text
            style={
              styles.continueText
            }
          >
            {saving
              ? "..."
              : t.continue}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ======================================
// STYLES
// ======================================

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