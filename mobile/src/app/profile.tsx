import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";

import { useEffect, useState } from "react";
import { getUser, updateUser } from "../api/api";
import { useLanguage } from "../i18n/LanguageContext";
import { Language } from "../i18n/translations";

const USER_ID = 2;

const PROFESSIONS = [
  "Farmer",
  "Traveler",
  "Researcher",
  "Disaster Management",
  "General User",
];

const LANGUAGES: Language[] = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Marathi",
];

export default function ProfileScreen() {
  const {
    t,
    language: currentLanguage,
    setLanguage: changeLanguage,
  } = useLanguage();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [profession, setProfession] = useState("");
  const [language, setLanguage] =useState<Language>(currentLanguage);

  const [showProfession, setShowProfession] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser(USER_ID);

        setUser(data);

        setProfession(
          data.profession || "General User"
        );

        setLanguage(
          data.language || currentLanguage
        );
      } catch (error) {
        console.error(
          "Error fetching profile:",
          error
        );

        Alert.alert(
          t.error,
          t.failedProfile
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const getProfessionText = (item: string) => {
    switch (item) {
      case "Farmer":
        return t.farmer;

      case "Traveler":
        return t.traveler;

      case "Researcher":
        return t.researcher;

      case "Disaster Management":
        return t.disasterManagement;

      default:
        return t.generalUser;
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);

      // Update PostgreSQL
      const updatedUser = await updateUser(
        USER_ID,
        {
          profession,
          language,
        }
      );

      // Update language throughout the app
      await changeLanguage(language);

      setUser(updatedUser);

      Alert.alert(
        t.profileUpdated,
        t.profileSaved
      );
    } catch (error) {
      console.error(
        "Error updating profile:",
        error
      );

      Alert.alert(
        t.error,
        t.unableUpdateProfile
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {t.loading}
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {t.failedProfile}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* TITLE */}

      <Text style={styles.title}>
        {t.profile}
      </Text>

      {/* NAME */}

      <View style={styles.card}>
        <Text style={styles.label}>
          {t.name}
        </Text>

        <Text style={styles.value}>
          {user.name || t.notSet}
        </Text>
      </View>

      {/* PROFESSION */}

      <View style={styles.card}>
        <Text style={styles.label}>
          {t.profession}
        </Text>

        <Pressable
          style={styles.selector}
          onPress={() =>
            setShowProfession(true)
          }
        >
          <Text style={styles.selectorText}>
            {getProfessionText(profession)}
          </Text>

          <Text style={styles.arrow}>
            ▼
          </Text>
        </Pressable>
      </View>

      {/* LANGUAGE */}

      <View style={styles.card}>
        <Text style={styles.label}>
          🌐 {t.language}
        </Text>

        <Pressable
          style={styles.selector}
          onPress={() =>
            setShowLanguage(true)
          }
        >
          <Text style={styles.selectorText}>
            {language}
          </Text>

          <Text style={styles.arrow}>
            ▼
          </Text>
        </Pressable>
      </View>

      {/* LOCATION */}

      <View style={styles.card}>
        <Text style={styles.label}>
          {t.location}
        </Text>

        <Text style={styles.value}>
          {user.latitude !== null &&
          user.latitude !== undefined &&
          user.longitude !== null &&
          user.longitude !== undefined
            ? `${user.latitude}, ${user.longitude}`
            : t.locationNotSet}
        </Text>
      </View>

      {/* SAVE BUTTON */}

      <Pressable
        style={[
          styles.saveButton,
          saving && styles.disabledButton,
        ]}
        onPress={saveProfile}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving
            ? t.saving
            : t.saveChanges}
        </Text>
      </Pressable>

      {/* PROFESSION MODAL */}

      <Modal
        visible={showProfession}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowProfession(false)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>

            <Text style={styles.modalTitle}>
              {t.selectProfession}
            </Text>

            {PROFESSIONS.map((item) => (
              <Pressable
                key={item}
                style={styles.option}
                onPress={() => {
                  setProfession(item);
                  setShowProfession(false);
                }}
              >
                <Text style={styles.optionText}>
                  {profession === item
                    ? "◉ "
                    : "○ "}

                  {getProfessionText(item)}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() =>
                setShowProfession(false)
              }
            >
              <Text style={styles.cancel}>
                {t.cancel}
              </Text>
            </Pressable>

          </View>
        </View>
      </Modal>

      {/* LANGUAGE MODAL */}

      <Modal
        visible={showLanguage}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowLanguage(false)
        }
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>

            <Text style={styles.modalTitle}>
              {t.selectLanguage}
            </Text>

            {LANGUAGES.map((item) => (
              <Pressable
                key={item}
                style={styles.option}
                onPress={() => {
                  setLanguage(item);
                  setShowLanguage(false);
                }}
              >
                <Text style={styles.optionText}>
                  {language === item
                    ? "◉ "
                    : "○ "}

                  {item}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() =>
                setShowLanguage(false)
              }
            >
              <Text style={styles.cancel}>
                {t.cancel}
              </Text>
            </Pressable>

          </View>
        </View>
      </Modal>

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
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#eeeeee",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },

  value: {
    fontSize: 18,
  },

  selector: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectorText: {
    fontSize: 17,
  },

  arrow: {
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: "#1683f7",
    borderRadius: 15,
    padding: 17,
    alignItems: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },

  text: {
    fontSize: 17,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  option: {
    paddingVertical: 15,
  },

  optionText: {
    fontSize: 18,
  },

  cancel: {
    textAlign: "center",
    fontSize: 17,
    marginTop: 15,
    paddingVertical: 10,
  },
});