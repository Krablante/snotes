// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Конфигурация из консоли Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQa3AMM0A-5jo5-XBDZ25gZ8pXKWX2VPk",
  authDomain: "spacenotes-app.firebaseapp.com",
  projectId: "spacenotes-app",
  storageBucket: "spacenotes-app.firebasestorage.app",
  messagingSenderId: "574472155510",
  appId: "1:574472155510:web:0b6ed98eca9feaf2b24a57"
};


// Инициализируем Firebase
const app = initializeApp(firebaseConfig);

// Экспортируем модули
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
