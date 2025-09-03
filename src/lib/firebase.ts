import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  signInAnonymously,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User's actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS0sW4l6TiYkEL-oTwUGbtUs6dNi_J2jI",
  authDomain: "mindful-moment-d65f8.firebaseapp.com",
  projectId: "mindful-moment-d65f8",
  storageBucket: "mindful-moment-d65f8.appspot.com",
  messagingSenderId: "323986753493",
  appId: "1:323986753493:web:84daf90fc2f77d1ce89f5c"
};

let app: any;
let db: any;
let auth: any;
let isFirebaseAvailable = true;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  db = getFirestore(app);

  // Proper React Native Auth initialization with AsyncStorage persistence
  // Basic auth init without explicit persistence to avoid type mismatch issues
  auth = initializeAuth(app, {} as any);
} catch (error) {
  console.warn('Firebase initialization failed, running in offline mode:', error);
  isFirebaseAvailable = false;
  // Create mock objects for offline mode
  db = null;
  auth = null;
}

// Add retry logic and error handling to prevent infinite loops
let signInAttempts = 0;
const MAX_SIGN_IN_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 seconds

const signIn = async (): Promise<any> => {
  // If Firebase is not available, return a mock user
  if (!isFirebaseAvailable || !auth) {
    console.log('Firebase not available, using offline mode');
    return { uid: 'offline-user', isAnonymous: true };
  }

  if (signInAttempts >= MAX_SIGN_IN_ATTEMPTS) {
    console.warn('Max sign-in attempts reached, switching to offline mode');
    return { uid: 'offline-user', isAnonymous: true };
  }

  if (auth.currentUser) return auth.currentUser;

  try {
    signInAttempts++;
    const userCredential = await signInAnonymously(auth);
    console.log("Signed in anonymously:", userCredential.user.uid);
    signInAttempts = 0; // Reset on success
    return userCredential.user;
  } catch (error: any) {
    console.error(`Error signing in anonymously (attempt ${signInAttempts}):`, error);

    // If it's a configuration error, don't retry
    if (error.code === 'auth/configuration-not-found') {
      console.error('Firebase configuration error detected, switching to offline mode');
      isFirebaseAvailable = false;
      return { uid: 'offline-user', isAnonymous: true };
    }

    // For other errors, retry after delay
    if (signInAttempts < MAX_SIGN_IN_ATTEMPTS) {
      console.log(`Retrying sign-in in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return signIn(); // Recursive retry
    }

    // Fallback to offline mode
    return { uid: 'offline-user', isAnonymous: true };
  }
};

// Mock onAuthStateChanged for offline mode
const onAuthStateChanged = (authInstance: any, callback: (user: any) => void) => {
  if (!isFirebaseAvailable || !authInstance) {
    // In offline mode, immediately call with mock user
    callback({ uid: 'offline-user', isAnonymous: true });
    return () => {}; // Return empty unsubscribe function
  }

  return firebaseOnAuthStateChanged(authInstance, callback);
};

export { db, auth, signIn, onAuthStateChanged };
