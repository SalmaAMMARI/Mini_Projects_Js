<template>
  <div class="signup-container">
    <h1 class="page-title">Sign up page</h1>
    <div class="signup-form">
      <input 
        type="email" 
        placeholder="enter your mail" 
        v-model="Email"
        class="input-field">
      <input 
        type="text" 
        placeholder="enter your FirstName" 
        v-model="FirstName"
        class="input-field">
      <input 
        type="text" 
        placeholder="enter your LastName" 
        v-model="LastName"
        class="input-field">
      <input 
        type="password" 
        placeholder="enter your password" 
        v-model="Password"
        class="input-field">
      <button @click="Signup" class="signup-button">Sign up</button>
      <div class="login-link-container">
        <router-link to="/login" class="login-link">you already have an account ? Log in</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

export default {
  name: "SignUp",
  data() {
    return {
      FirstName: "",
      LastName: "",
      Password: "",
      Email: "",
    };
  },
  methods: {
    isUM6PEmail(email) {
      return email.toLowerCase().endsWith('@um6p.ma');
    },
    async Signup() {
      try {
        if (this.isUM6PEmail(this.Email)) {
          const auth = getAuth();
          const db = getFirestore();
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            this.Email,
            this.Password
          );
          const userId = userCredential.user.uid;
          
          await setDoc(doc(db, 'users', userId), {
            FirstName: this.FirstName,
            LastName: this.LastName,
            Email: this.Email,
            isOnline: true,
            createdAt: serverTimestamp()
          });
          
          this.$router.push(`/forum/${userId}`);
        } else {
          alert("The Email should be in um6p domain");
        }
      } catch (error) {
        console.error("Signup error:", error);
        
        if (error.code === 'auth/email-already-in-use') {
          alert("This email is already registered. Please use a different email or login instead.");
        } else {
          alert("Signup failed: " + error.message);
        }
      }
    }
  }
};
</script>

<style scoped>
.signup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f8fa;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  padding: 20px;
}

.page-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
  font-weight: 500;
}

.signup-form {
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

.signup-button {
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

.signup-button:hover {
  background-color: #3a5cf5;
}

.login-link-container {
  margin-top: 24px;
  text-align: center;
}

.login-link {
  color: #4a6cf7;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #3a5cf5;
  text-decoration: underline;
}
</style>