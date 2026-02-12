import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBlCtexQgQNz5uD7HMG2kYH40g9SYJoQ58",
  authDomain: "whsxg-ru.firebaseapp.com",
  databaseURL: "https://whsxg-ru-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "whsxg-ru",
  storageBucket: "whsxg-ru.firebasestorage.app",
  messagingSenderId: "121744090906",
  appId: "1:121744090906:web:8846141b95320195992ea3",
  measurementId: "G-CNLF693PS1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
