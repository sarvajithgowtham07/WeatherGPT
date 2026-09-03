import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";

import { router } from "expo-router";

import { useLanguage } from "../i18n/LanguageContext";

export default function SettingsScreen() {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t.settings}
      </Text>

      {/* Profile */}

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push("/profile")
        }
      >
        <Text style={styles.buttonText}>
          {t.profileProfession}
        </Text>
      </Pressable>

      {/* Language */}

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push("/language")
        }
      >
        <Text style={styles.buttonText}>
          🌐 {t.language}
        </Text>
      </Pressable>

      {/* Other Settings */}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {t.appSettings}
        </Text>

        <Text style={styles.cardText}>
          {t.settingsComingSoon}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
  },

  button: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#eeeeee",
    marginBottom: 15,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: "600",
  },

  card: {
    marginTop: 5,
    padding: 18,
    borderRadius: 12,
    backgroundColor: "#eeeeee",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 8,
  },

  cardText: {
    fontSize: 15,
  },
});