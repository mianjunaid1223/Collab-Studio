
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// A function to safely initialize and get the Firebase app instance.
// This is memoized to ensure it's only called once.
let app: FirebaseApp | null = null;
export function getFirebaseApp(): FirebaseApp | null {
  if (app) {
    return app;
  }

  const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;
  if (!isConfigValid) {
    console.warn(
      "Firebase configuration is missing or incomplete. Firebase features will be disabled."
    );
    return null;
  }

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  return app;
}
