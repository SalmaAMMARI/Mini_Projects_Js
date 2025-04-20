import { createApp } from 'vue'
import App from './App.vue'
import router from './router'


import { initializeApp } from 'firebase/app'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfFcRBxn933Kzcy9fz65bwBsdDB2vUtYw",
  authDomain: "chitchat-f4cec.firebaseapp.com",
  projectId: "chitchat-f4cec",
  storageBucket: "chitchat-f4cec.firebasestorage.app",
  messagingSenderId: "1017286912746",
  appId: "1:1017286912746:web:a4c429e8ba16f862274593",
  measurementId: "G-6FQS0RD2S2"
};

// Initialize Firebase
initializeApp(firebaseConfig)

// Create Vue app
createApp(App).use(router).mount('#app')
