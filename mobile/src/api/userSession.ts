import AsyncStorage from "@react-native-async-storage/async-storage";

import { createUser } from "./api";

const USER_ID_STORAGE_KEY = "weathergpt_user_id";

// Keep the id in memory too, so we don't hit
// AsyncStorage repeatedly in the same app session.
let cachedUserId: number | null = null;

/**
 * Returns the current device's backend user id,
 * creating the user on the backend the very first
 * time the app runs (and remembering the id after
 * that, both in memory and on disk).
 */
export async function getOrCreateUserId(): Promise<number> {
  if (cachedUserId !== null) {
    return cachedUserId;
  }

  const storedId = await AsyncStorage.getItem(
    USER_ID_STORAGE_KEY
  );

  if (storedId) {
    cachedUserId = parseInt(storedId, 10);
    return cachedUserId;
  }

  // No user yet for this device - create one.
  const user = await createUser({});
  const newUserId: number = user.id;

  cachedUserId = newUserId;

  await AsyncStorage.setItem(
    USER_ID_STORAGE_KEY,
    String(newUserId)
  );

  return newUserId;
}
