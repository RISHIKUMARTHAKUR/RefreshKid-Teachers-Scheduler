import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDRLssDPHWYkp1uGcN6SrN6_Q-do4Wx2-w",
  authDomain: "task-scheduler-plna6.firebaseapp.com",
  databaseURL: "https://task-scheduler-plna6-default-rtdb.firebaseio.com",
  projectId: "task-scheduler-plna6",
  storageBucket: "task-scheduler-plna6.appspot.com",
  messagingSenderId: "528235529078",
  appId: "1:528235529078:web:ab44d08311bc8119a93057"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
