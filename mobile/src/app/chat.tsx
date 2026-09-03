import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

import {
  createChatSession,
  sendChatMessage,
  transcribeAudio,
} from "../api/api";

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

import { useLanguage } from "../i18n/LanguageContext";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
};

export default function ChatScreen() {
  const { t } = useLanguage();

  // ==============================
  // STATE
  // ==============================

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [input, setInput] =
    useState("");

  const [sessionId, setSessionId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const USER_ID = 2;

  // ==============================
  // AUDIO RECORDER
  // ==============================

  const audioRecorder =
    useAudioRecorder(
      RecordingPresets.HIGH_QUALITY
    );

  const recorderState =
    useAudioRecorderState(
      audioRecorder
    );

  // ==============================
  // START CHAT
  // ==============================

  useEffect(() => {
    startChat();
  }, []);

  async function startChat() {
    try {
      const session =
        await createChatSession(USER_ID);

      setSessionId(session.id);

      setMessages([
        {
          id: "welcome",
          role: "assistant",
          message:
            t.weatherAssistantWelcome,
        },
      ]);
    } catch (error) {
      console.error(
        "Chat session error:",
        error
      );

      Alert.alert(
        t.connectionError,
        t.unableToConnect
      );
    }
  }

  // ==============================
  // SEND MESSAGE
  // ==============================

  async function handleSend() {
    const text = input.trim();

    if (
      !text ||
      !sessionId ||
      loading
    ) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      message: text,
    };

    setMessages(
      (previous) => [
        ...previous,
        userMessage,
      ]
    );

    setInput("");
    setLoading(true);

    try {
      const result =
        await sendChatMessage(
          sessionId,
          text
        );

      const assistantMessage:
        ChatMessage = {
        id:
          Date.now().toString() +
          "-assistant",

        role: "assistant",

        message:
          result.response,
      };

      setMessages(
        (previous) => [
          ...previous,
          assistantMessage,
        ]
      );
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      setMessages(
        (previous) => [
          ...previous,
          {
            id:
              Date.now().toString() +
              "-error",

            role: "assistant",

            message:
              t.chatError,
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // MICROPHONE
  // ==============================

  async function handleMicPress() {
    try {
      // STOP RECORDING
      if (
        recorderState.isRecording
      ) {
        console.log(
          "Stopping recording..."
        );

        await audioRecorder.stop();

        const audioUri =
          audioRecorder.uri;

        if (!audioUri) {
          Alert.alert(
            t.recordingError,
            t.audioNotFound
          );

          return;
        }

        setLoading(true);

        try {
          const result =
            await transcribeAudio(
              audioUri
            );

          if (
            result &&
            typeof result.text ===
              "string" &&
            result.text.trim()
          ) {
            setInput(
              result.text
            );

            Alert.alert(
              t.voiceRecognized,
              result.text
            );
          } else {
            Alert.alert(
              t.noSpeech,
              t.tryAgain
            );
          }
        } catch (error) {
          console.error(
            "Transcription error:",
            error
          );

          Alert.alert(
            t.transcriptionError,
            t.transcriptionFailed
          );
        } finally {
          setLoading(false);
        }

        return;
      }

      // MICROPHONE PERMISSION

      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          t.microphonePermission,
          t.allowMicrophone
        );

        return;
      }

      // AUDIO MODE

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });

      // PREPARE RECORDER

      await audioRecorder.prepareToRecordAsync();

      // START RECORDING

      audioRecorder.record();

      console.log(
        "Real microphone recording started."
      );
    } catch (error) {
      console.error(
        "Microphone error:",
        error
      );

      Alert.alert(
        t.microphoneError,
        t.microphoneFailed
      );
    }
  }

  // ==============================
  // MESSAGE
  // ==============================

  function renderMessage({
    item,
  }: {
    item: ChatMessage;
  }) {
    const isUser =
      item.role === "user";

    return (
      <View
        style={[
          styles.messageContainer,

          isUser
            ? styles.userContainer
            : styles.assistantContainer,
        ]}
      >
        <View
          style={[
            styles.bubble,

            isUser
              ? styles.userBubble
              : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,

              isUser &&
                styles.userText,
            ]}
          >
            {item.message}
          </Text>
        </View>
      </View>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
      keyboardVerticalOffset={0}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.title}>
          WeatherGPT
        </Text>

        <Text style={styles.subtitle}>
          {t.aiWeatherAssistant}
        </Text>
      </View>

      {/* MESSAGES */}

      <FlatList
        style={styles.messages}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) =>
          item.id
        }
        contentContainerStyle={
          styles.messagesList
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      />

      {/* LOADING */}

      {loading && (
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            {recorderState.isRecording
              ? t.recording
              : t.thinking}
          </Text>
        </View>
      )}

      {/* INPUT */}

      <View
        style={
          styles.inputContainer
        }
      >
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={
            setInput
          }
          placeholder={
            t.typeMessage
          }
          placeholderTextColor="#888"
          multiline
          textAlignVertical="center"
        />

        {/* MICROPHONE */}

        <TouchableOpacity
          style={[
            styles.micButton,

            recorderState.isRecording &&
              styles.micRecordingButton,
          ]}
          onPress={
            handleMicPress
          }
          disabled={
            loading &&
            !recorderState.isRecording
          }
        >
          <Text
            style={styles.micText}
          >
            {recorderState.isRecording
              ? "⏹️"
              : "🎤"}
          </Text>
        </TouchableOpacity>

        {/* SEND */}

        <TouchableOpacity
          style={
            styles.sendButton
          }
          onPress={
            handleSend
          }
          disabled={loading}
        >
          <Text
            style={styles.sendText}
          >
            {t.send}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ==============================
// STYLES
// ==============================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },

  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#666",
  },

  messages: {
    flex: 1,
  },

  messagesList: {
    padding: 15,
    paddingBottom: 20,
    flexGrow: 1,
  },

  messageContainer: {
    marginVertical: 5,
    flexDirection: "row",
  },

  userContainer: {
    justifyContent: "flex-end",
  },

  assistantContainer: {
    justifyContent: "flex-start",
  },

  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },

  userBubble: {
    backgroundColor: "#007AFF",
  },

  assistantBubble: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#222",
  },

  userText: {
    color: "white",
  },

  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 8,
  },

  loadingText: {
    marginLeft: 8,
    color: "#666",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    color: "#000",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },

  micButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#eeeeee",
  },

  micRecordingButton: {
    backgroundColor: "#ffdddd",
  },

  micText: {
    fontSize: 21,
  },

  sendButton: {
    marginLeft: 8,
    backgroundColor: "#007AFF",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 22,
  },

  sendText: {
    color: "white",
    fontWeight: "bold",
  },
});