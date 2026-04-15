import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"

const firebaseConfig = {
    apiKey: "AIzaSyC6Og0HnsPYakcW8glklBp1m4nq0HnUHOw",
    authDomain: "lifetimelabs-online.firebaseapp.com",
    projectId: "lifetimelabs-online",
    storageBucket: "lifetimelabs-online.firebasestorage.app",
    messagingSenderId: "448707262284",
    appId: "1:448707262284:web:ff0cf94b3128aceac581e9",
    measurementId: "G-4JRNFYGMRJ"
};

export const app = initializeApp(firebaseConfig)