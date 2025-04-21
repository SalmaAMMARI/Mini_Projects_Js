<template>
  <div class="auth-container">
    <div class="auth-card">
      <h3>Welcome Back</h3>
      <div class="form-group">
        <input type="email" placeholder="Email" v-model="email" />
      </div>
      <div class="form-group">
        <input type="password" placeholder="Password" v-model="password" />
      </div>
      <button @click="login">Log In</button>
      <p>Don't have an account? <router-link to="/signup" class="auth-link">Sign Up</router-link></p>
      <p>
  Forgot your password?
  <router-link to="/forgot-password" class="link">Reset it</router-link>
</p>
    </div>
  </div>
</template>
  
  <script>
  import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
  
  export default {
    name: "Login",
    data() {
      return {
        email: "",
        password: ""
      };
    },
    methods: {
      async login() {
        const auth = getAuth();
        try {
          await signInWithEmailAndPassword(auth, this.email, this.password);
          this.$router.push({ 
  name: 'Forum', 
});
        } catch (error) {
          alert("Login failed: " + error.message);
        }
      },
      async sendResetEmail() {
        const auth = getAuth();
        if (!this.email) {
          alert("Please enter your email to receive a reset link.");
          return;
        }
        try {
          await sendPasswordResetEmail(auth, this.email);
          alert("Reset email sent. Check your inbox.");
        } catch (error) {
          alert("Error: " + error.message);
        }
      }
    }
  };
  </script>
<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
  padding: 20px;
}

.auth-card {
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 16px;
  box-shadow: 
    0 15px 35px rgba(50, 50, 93, 0.1),
    0 5px 15px rgba(0, 0, 0, 0.07);
  width: 100%;
  max-width: 420px;
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.auth-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 18px 40px rgba(50, 50, 93, 0.15),
    0 8px 20px rgba(0, 0, 0, 0.1);
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #3498db 0%, #2ecc71 100%);
}

.auth-card h3 {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #2c3e50;
  font-weight: 600;
  letter-spacing: -0.5px;
}

.auth-card input {
  width: 100%;
  padding: 1rem;
  margin-bottom: 1.25rem;
  border: 2px solid #e6e9f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f8f9fc;
}

.auth-card input:focus {
  outline: none;
  border-color: #3498db;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.auth-card input::placeholder {
  color: #a7a9c0;
}

.auth-card button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right, #3498db, #2ecc71);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);
}

.auth-card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.2);
  opacity: 0.9;
}

.auth-card button:active {
  transform: translateY(0);
}

.auth-card p {
  margin-top: 1.5rem;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.auth-link {
  color: #3498db;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: inline-block;
  text-decoration: none;
}

.auth-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #3498db;
  transition: width 0.2s ease;
}

.auth-link:hover {
  color: #2980b9;
  text-decoration: none;
}

.auth-link:hover::after {
  width: 100%;
}

/* Form Group for Better Spacing */
.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

/* Responsive Adjustments */
@media (max-width: 480px) {
  .auth-card {
    padding: 2rem 1.5rem;
  }
  
  .auth-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .auth-card input {
    padding: 0.9rem;
  }
}
  </style>
  

  