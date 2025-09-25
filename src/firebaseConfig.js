// client/src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAQx6m6T0ecpUWGfj0i4YzbNT3Idyi3ebQ",
    authDomain: "quizapp-e3d3e.firebaseapp.com",
    projectId: "quizapp-e3d3e",
    storageBucket: "quizapp-e3d3e.firebasestorage.app",
    messagingSenderId: "640426455323",
    appId: "1:640426455323:web:69ba49c8db92908af123be",
    measurementId: "G-ZMB0ZEM8QQ"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
