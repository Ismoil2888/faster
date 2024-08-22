// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjujZ-kxrjhN3EORAJbMLjISdP9Q7Bruo",
  authDomain: "myreact-app-width-firebase.firebaseapp.com",
  databaseURL: "https://myreact-app-width-firebase-default-rtdb.firebaseio.com",
  projectId: "myreact-app-width-firebase",
  storageBucket: "myreact-app-width-firebase.appspot.com",
  messagingSenderId: "1000041753298",
  appId: "1:1000041753298:web:db5564deab6251aca4db0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);