import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required config values are present
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

// Initialize app only if config is valid
const app: FirebaseApp | null = isConfigValid
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp()
  : null;

if (!isConfigValid) {
    console.warn(
      "Firebase configuration is missing or incomplete. Please add your Firebase credentials to a .env.local file at the root of your project. Firebase features will be disabled."
    );
}

export { app };
