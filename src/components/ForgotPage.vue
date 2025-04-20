<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <h2 class="forgot-title">Forgot Password?</h2>
      <p class="forgot-subtitle">No worries, we'll send you reset instructions.</p>
      
      <div class="form-group">
        <label for="email">Email Address</label>
        <div class="input-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <input 
            type="email" 
            id="email"
            placeholder="Enter your email" 
            v-model="email"
            class="form-input"
          >
        </div>
      </div>
      
      <!-- Notification messages -->
      <div v-if="successMessage" class="notification success">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="notification-icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>{{ successMessage }}</span>
      </div>
      
      <div v-if="errorMessage" class="notification error">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="notification-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>
      
      <button @click="sendResetEmail" class="reset-button">
        <span>Reset Password</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="button-icon">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
      
      <router-link to="/login" class="back-link">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Login
      </router-link>
    </div>
  </div>
</template>

<script>
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default {
  name: "ForgotPassword",
  data() {
    return {
      email: "",
      successMessage: "",
      errorMessage: ""
    };
  },
  methods: {
    async sendResetEmail() {
      // Clear previous messages
      this.successMessage = "";
      this.errorMessage = "";
      
      // Validate email
      if (!this.email) {
        this.errorMessage = "Please enter your email";
        return;
      }
      
      try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, this.email);
        this.successMessage = "Password reset email sent! Please check your inbox.";
        this.email = "";
      } catch (error) {
        console.error(error);
        this.errorMessage = error.message || "Failed to send reset email";
      }
    }
  }
};
</script>

<style scoped>
:root {
  --primary-color: #3a6ea5;
  --secondary-color: #f0f4f8;
  --accent-color: #6c9bcf;
  --text-color: #333;
  --error-color: #e63946;
  --success-color: #2a9d8f;
  --shadow-color: rgba(0, 0, 0, 0.08);
  --gradient-start: #f8f9fa;
  --gradient-end: #e9ecef;
}

.forgot-password-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
}

.forgot-password-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
}

.forgot-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.forgot-subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.input-container {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #aaa;
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(108, 155, 207, 0.15);
}

.reset-button {
  width: 100%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0;
}

.reset-button:hover {
  background-color: #2c5580;
  transform: translateY(-2px);
}

.button-icon {
  width: 16px;
  height: 16px;
  margin-left: 8px;
}

.notification {
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.notification-icon {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  flex-shrink: 0;
}

.success {
  background-color: rgba(42, 157, 143, 0.1);
  color: var(--success-color);
  border: 1px solid rgba(42, 157, 143, 0.2);
}

.success .notification-icon {
  color: var(--success-color);
}

.error {
  background-color: rgba(230, 57, 70, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(230, 57, 70, 0.2);
}

.error .notification-icon {
  color: var(--error-color);
}

.back-link {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.3s;
}

.back-link:hover {
  color: #2c5580;
}

.back-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

@media (max-width: 480px) {
  .forgot-password-card {
    padding: 2rem 1.5rem;
  }
  
  .forgot-title {
    font-size: 1.6rem;
  }
}
</style>