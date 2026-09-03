import { fetch as expoFetch } from "expo/fetch";
import { File } from "expo-file-system";
import { WeatherResponse } from "./weather";

const API_BASE_URL = "http://192.168.29.28:8000/api/v1";

export async function checkBackendHealth() {
  const response = await fetch(
    `${API_BASE_URL}/health`
  );

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  return await response.json();
}

export async function createUser(userData: {
  name?: string;
  profession?: string;
  language?: string;
  latitude?: number;
  longitude?: number;
}) {
  const response = await fetch(
    `${API_BASE_URL}/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return await response.json();
}

export async function getUser(userId: number) {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return await response.json();
}

export async function getWeather(
  latitude: number,
  longitude: number
): Promise<WeatherResponse> {
  const response = await fetch(
    `${API_BASE_URL}/weather/?latitude=${latitude}&longitude=${longitude}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  return await response.json();
}

export async function searchLocation(
  name: string
) {
  const response = await fetch(
    `${API_BASE_URL}/location/search?name=${encodeURIComponent(
      name
    )}`
  );

  if (!response.ok) {
    throw new Error("Failed to search location");
  }

  return await response.json();
}

export async function createChatSession(
  userId: number
) {
  const response = await fetch(
    `${API_BASE_URL}/chat/sessions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create chat session"
    );
  }

  return await response.json();
}

export async function sendChatMessage(
  sessionId: number,
  message: string
) {
  const response = await fetch(
    `${API_BASE_URL}/chat/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        role: "user",
        message: message,
      }),
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    console.log(
      "Chat API status:",
      response.status
    );

    console.log(
      "Chat API error:",
      errorText
    );

    throw new Error(
      `Chat API failed: ${response.status} ${errorText}`
    );
  }

  return await response.json();
}

/* --------------------------------
   VOICE TRANSCRIPTION
-------------------------------- */

export async function transcribeAudio(audioUri: string) {
  console.log("Uploading audio:", audioUri);

  const audioFile = new File(audioUri);

  console.log("Audio file exists:", audioFile.exists);
  console.log("Audio file size:", audioFile.size);

  const formData = new FormData();

  formData.append("file", audioFile as any);

  console.log("Sending transcription request...");

  const response = await expoFetch(
    `${API_BASE_URL}/voice/transcribe`,
    {
      method: "POST",
      body: formData,
    }
  );

  console.log("Transcription response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();

    console.log("Transcription API error:", errorText);

    throw new Error(
      `Transcription failed: ${response.status}`
    );
  }

  return await response.json();
}

export async function updateUser(
  userId: number,
  userData: {
    name?: string;
    profession?: string;
    language?: string;
    latitude?: number;
    longitude?: number;
  }
) {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.log(
      "Update user error:",
      errorText
    );

    throw new Error(
      `Failed to update user: ${response.status}`
    );
  }

  return await response.json();
}