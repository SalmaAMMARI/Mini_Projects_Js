import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// ✅ Modular import for Firebase v9+
import { initializeApp } from 'firebase/app'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD6Ls27tC0PCig7KSVBBrAwYdJYukNPRQk",
  authDomain: "projectspd-c4560.firebaseapp.com",
  projectId: "projectspd-c4560",
  storageBucket: "projectspd-c4560.appspot.com",
  messagingSenderId: "161091067585",
  appId: "1:161091067585:web:7f9b054cc176805801fe40"
}

// Initialize Firebase
initializeApp(firebaseConfig)

// Create Vue app
createApp(App).use(router).mount('#app')
