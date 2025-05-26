// Import the functions you need from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
// Import additional Firebase services as needed
// import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDe18gD6SF4iZSgGmKxNZNdNBZhlkrTfUg",
  authDomain: "chatbot-43b76.firebaseapp.com",
  projectId: "chatbot-43b76",
  storageBucket: "chatbot-43b76.appspot.com",
  messagingSenderId: "482784554176",
  appId: "1:482784554176:web:b2a5d7ed8f802bdfc7d125",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log("Firebase initialized:", app.name);
