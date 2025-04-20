<template>
  <div class="login-container">
    <h1 class="app-title">Welcome to our ChatAPP</h1>
    <div class="login-form">
      <input 
        type="email" 
        placeholder="Email" 
        v-model="email"
        class="input-field">
      <input 
        type="password" 
        placeholder="Enter your password" 
        v-model="password"
        class="input-field">
      <button @click="login" class="login-button">Log in</button>
      <div class="auth-links">
        <p class="no-account">Don't have an account?</p>
        <router-link to="/signup" class="signup-link">Sign Up</router-link>
        <router-link to="/forgot" class="forgot-link">Forgot password?</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    async login() {
      try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const userId = userCredential.user.uid;
        
        // Update the user's isOnline status to true
        const db = getFirestore();
        await updateDoc(doc(db, 'users', userId), {
          isOnline: true
        });
        
        this.$router.push(`/forum/${userId}`);
      } catch (error) {
        console.error("Login error:", error);
        alert("Login failed: " + error.message);
      }
    }
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f8fa;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.app-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 32px;
  font-weight: 500;
}

.login-form {
  background-color: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
}

.input-field {
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  border-color: #4a6cf7;
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.1);
}

.login-button {
  padding: 14px 20px;
  background-color: #4a6cf7;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 8px;
}

.login-button:hover {
  background-color: #3a5cf5;
}

.auth-links {
  margin-top: 24px;
  text-align: center;
}

.no-account {
  color: #666;
  margin-bottom: 8px;
}

.signup-link, .forgot-link {
  display: block;
  color: #4a6cf7;
  text-decoration: none;
  margin: 8px 0;
  font-weight: 500;
  transition: color 0.2s ease;
}

.signup-link:hover, .forgot-link:hover {
  color: #3a5cf5;
  text-decoration: underline;
}
</style>