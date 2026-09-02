import { WeatherResponse } from "./weather";

const API_BASE_URL = "http://192.168.57.213:8000/api/v1";

export async function checkBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);

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
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return await response.json();
}

export async function getUser(userId: number) {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`);

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
export async function searchLocation(name: string) {
  const response = await fetch(
    `${API_BASE_URL}/location/search?name=${encodeURIComponent(name)}`
  );

  if (!response.ok) {
    throw new Error("Failed to search location");
  }

  return await response.json();
}