import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBegUJtG3Bab9W9paE6nbLTstEGhVxzvmo",
  authDomain: "fincore-5ac16.firebaseapp.com",
  projectId: "fincore-5ac16",
  storageBucket: "fincore-5ac16.firebasestorage.app",
  messagingSenderId: "1050021937411",
  appId: "1:1050021937411:web:52404701123f8cdb1c2936",
  measurementId: "G-LRW3BD5J22"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);