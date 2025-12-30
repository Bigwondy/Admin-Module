import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGAAVH_vHrm11lUOpCF9FK_j6JqFYlkcM",
  authDomain: "bank-admin-3f0bb.firebaseapp.com",
  projectId: "bank-admin-3f0bb",
  storageBucket: "bank-admin-3f0bb.firebasestorage.app",
  messagingSenderId: "1014255725012",
  appId: "1:1014255725012:web:8f58e75dd363e02e9f0e41",
  measurementId: "G-6CCF0562TZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
