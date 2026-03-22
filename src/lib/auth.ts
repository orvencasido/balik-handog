import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase/client";

/**
 * Authenticate a user with email + password.
 * Returns the Firebase User on success, throws on failure.
 */
export async function login(email: string, password: string) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (error: any) {
    console.error("Login failed:", error);
    throw error;
  }
}
