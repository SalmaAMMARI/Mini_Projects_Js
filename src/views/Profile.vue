<template>
  <div class="profile-container">
    <!-- Navbar Section -->
    <div class="navbar">
      <div class="navbar-container">
        <router-link to="/forum" class="logo">
          <i class="fas fa-comments"></i>
          <span>Forum</span>
        </router-link>
        
        <div class="nav-links">
          <router-link 
            to="/forum" 
            class="nav-link back-to-discussions"
            v-if="$route.path !== '/forum'"
          >
            <i class="fas fa-arrow-left"></i>
            <span>Back to Discussions</span>
          </router-link>
          
          <template v-if="user">
            <div class="user-greeting">
              <div class="initials-avatar" :style="navbarAvatarStyle">
                {{ navbarInitials }}
              </div>
              <span>Hello, {{ navbarDisplayName }}</span>
            </div>
            <button @click="logout" class="logout-button">
              <i class="fas fa-sign-out-alt"></i>
              <span>Log Out</span>
            </button>
          </template>
          <router-link v-else to="/login" class="login-button">
            <i class="fas fa-sign-in-alt"></i>
            <span>Log In</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- Profile Content -->
    <div class="profile-content">
      <h1>My Profile</h1>
      
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <div class="initials-avatar" :style="profileAvatarStyle">
              {{ profileInitials }}
            </div>
            
            <!-- Adding color picker for avatar background -->
            <div class="avatar-color-picker">
              <p>Avatar Color:</p>
              <div class="color-options">
                <div 
                  v-for="(color, index) in colorOptions" 
                  :key="index"
                  class="color-option"
                  :style="{ backgroundColor: color }"
                  :class="{ active: avatarColor === color }"
                  @click="selectAvatarColor(color)"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="profile-form">
          <!-- Personal Info Section -->
          <div class="form-section">
            <h2><i class="fas fa-user"></i> Personal Information</h2>
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="firstName" 
                  placeholder="Enter your first name"
                  @input="updateInitialsPreview"
                >
              </div>
              <div class="form-group">
                <label for="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="lastName" 
                  placeholder="Enter your last name"
                  @input="updateInitialsPreview"
                >
              </div>
            </div>
            <button 
              @click="updateProfile" 
              :disabled="!formChanged || updatingProfile" 
              class="save-btn"
            >
              <span v-if="!updatingProfile">Save Changes</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Saving...</span>
            </button>
          </div>
  
          <!-- Password Update Section -->
          <div class="form-section">
            <h2><i class="fas fa-lock"></i> Change Password</h2>
            <div class="form-group">
              <label for="currentPassword">Current Password</label>
              <input 
                type="password" 
                id="currentPassword" 
                v-model="currentPassword" 
                placeholder="Enter current password"
                @blur="validateCurrentPassword"
              >
              <div v-if="currentPasswordError" class="field-error">
                <i class="fas fa-exclamation-circle"></i> {{ currentPasswordError }}
              </div>
            </div>
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input 
                type="password" 
                id="newPassword" 
                v-model="newPassword" 
                placeholder="Enter new password (min 6 characters)"
                @blur="validateNewPassword"
                @input="validatePasswordMatch"
              >
              <div v-if="newPasswordError" class="field-error">
                <i class="fas fa-exclamation-circle"></i> {{ newPasswordError }}
              </div>
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                v-model="confirmPassword" 
                placeholder="Confirm new password"
                @blur="validatePasswordMatch"
              >
              <div v-if="confirmPasswordError" class="field-error">
                <i class="fas fa-exclamation-circle"></i> {{ confirmPasswordError }}
              </div>
            </div>
            <button 
              @click="updatePassword" 
              :disabled="!isPasswordFormValid || updatingPassword" 
              class="save-btn"
            >
              <span v-if="!updatingPassword">Change Password</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Updating...</span>
            </button>
          </div>
  
          <!-- Status Messages -->
          <div v-if="updateSuccess" class="success-message">
            <i class="fas fa-check-circle"></i> {{ successMessage }}
          </div>
          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signOut, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default {
  name: 'CombinedProfileView',
  data() {
    return {
      // User data
      user: null,
      firstName: '',
      lastName: '',
      originalFirstName: '',
      originalLastName: '',
      
      // Avatar
      avatarColor: '',
      originalAvatarColor: '',
      colorOptions: [
        '#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', 
        '#1abc9c', '#d35400', '#34495e', '#16a085', '#c0392b'
      ],
      navbarAvatarStyle: {
        backgroundColor: '',
        color: '#ffffff'
      },
      profileAvatarStyle: {
        backgroundColor: '',
        color: '#ffffff'
      },
      
      // Password
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      updatingPassword: false,
      currentPasswordError: '',
      newPasswordError: '',
      confirmPasswordError: '',
      
      // Status
      updatingProfile: false,
      updateSuccess: false,
      successMessage: '',
      errorMessage: ''
    }
  },
  computed: {
    // Profile Computed
    profileInitials() {
      return this.getInitials(this.firstName, this.lastName);
    },
    
    navbarInitials() {
      return this.getInitials(this.firstName, this.lastName);
    },
    
    navbarDisplayName() {
      return `${this.firstName} ${this.lastName}`.trim() || 'User';
    },
    
    formChanged() {
      return (this.firstName !== this.originalFirstName) || 
             (this.lastName !== this.originalLastName) ||
             (this.avatarColor !== this.originalAvatarColor);
    },
    
    displayName() {
      return `${this.firstName} ${this.lastName}`.trim();
    },
    
    isPasswordFormValid() {
      return this.currentPassword && 
             !this.currentPasswordError &&
             this.newPassword && 
             !this.newPasswordError &&
             this.confirmPassword && 
             !this.confirmPasswordError &&
             this.newPassword === this.confirmPassword;
    }
  },
  created() {
    const auth = getAuth();
    this.user = auth.currentUser;
    this.loadUserProfile();
  },
  methods: {
    // Avatar Methods
    selectAvatarColor(color) {
      this.avatarColor = color;
      this.navbarAvatarStyle.backgroundColor = color;
      this.profileAvatarStyle.backgroundColor = color;
    },
    
    generateRandomColor() {
      return this.colorOptions[Math.floor(Math.random() * this.colorOptions.length)];
    },
    
    getInitials(firstName, lastName) {
      const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    },
    
    updateInitialsPreview() {
      // Called when name changes to update the avatar preview
      // No need to change colors, just update the display
    },
    
    // Profile Methods
    async loadUserProfile() {
      if (!this.user) return;
      
      const db = getFirestore();
      
      try {
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', this.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Load name from Firestore
          this.firstName = userData.firstName || '';
          this.lastName = userData.lastName || '';
          
          // If no name in Firestore but exists in auth displayName, parse it
          if (!this.firstName && !this.lastName && this.user.displayName) {
            const names = this.user.displayName.split(' ');
            this.firstName = names[0] || '';
            this.lastName = names.slice(1).join(' ') || '';
          }
          
          // Load avatar color
          this.avatarColor = userData.avatarColor || this.generateRandomColor();
        } else if (this.user.displayName) {
          // No Firestore doc yet, but has display name in auth
          const names = this.user.displayName.split(' ');
          this.firstName = names[0] || '';
          this.lastName = names.slice(1).join(' ') || '';
          this.avatarColor = this.generateRandomColor();
        } else {
          // New user with no data
          this.avatarColor = this.generateRandomColor();
        }
        
        // Set original values for comparison
        this.originalFirstName = this.firstName;
        this.originalLastName = this.lastName;
        this.originalAvatarColor = this.avatarColor;
        
        // Apply avatar styles
        this.navbarAvatarStyle.backgroundColor = this.avatarColor;
        this.profileAvatarStyle.backgroundColor = this.avatarColor;
      } catch (error) {
        console.error('Error loading user profile:', error);
        this.errorMessage = 'Failed to load profile. Please try again.';
        
        // Set fallback values
        this.avatarColor = this.generateRandomColor();
        this.navbarAvatarStyle.backgroundColor = this.avatarColor;
        this.profileAvatarStyle.backgroundColor = this.avatarColor;
      }
    },
    
    async updateProfile() {
      if (!this.formChanged || !this.user) return;
      
      this.updatingProfile = true;
      this.errorMessage = '';
      
      try {
        const auth = getAuth();
        const db = getFirestore();
        const user = auth.currentUser;
        
        // Update auth display name
        await updateProfile(user, {
          displayName: this.displayName
        });
        
        // Update or create Firestore user document
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          // Update existing document
          await updateDoc(userRef, {
            firstName: this.firstName,
            lastName: this.lastName,
            displayName: this.displayName,
            avatarColor: this.avatarColor,
            // If you have a photoURL field, keep it
            photoURL: userDoc.data().photoURL || null,
            lastUpdated: new Date()
          });
        } else {
          // Create new document
          await setDoc(userRef, {
            firstName: this.firstName,
            lastName: this.lastName,
            displayName: this.displayName,
            avatarColor: this.avatarColor,
            email: user.email,
            createdAt: new Date(),
            lastUpdated: new Date()
          });
        }
        
        // Update original values
        this.originalFirstName = this.firstName;
        this.originalLastName = this.lastName;
        this.originalAvatarColor = this.avatarColor;
        
        this.showSuccess('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        this.errorMessage = this.getFirebaseError(error.code) || 'Failed to update profile. Please try again.';
      } finally {
        this.updatingProfile = false;
      }
    },
    
    // Password Methods
    validateCurrentPassword() {
      if (!this.currentPassword) {
        this.currentPasswordError = 'Current password is required';
      } else if (this.currentPassword.length < 6) {
        this.currentPasswordError = 'Password must be at least 6 characters';
      } else {
        this.currentPasswordError = '';
      }
    },
    
    validateNewPassword() {
      if (!this.newPassword) {
        this.newPasswordError = 'New password is required';
      } else if (this.newPassword.length < 6) {
        this.newPasswordError = 'Password must be at least 6 characters';
      } else if (this.newPassword === this.currentPassword) {
        this.newPasswordError = 'New password must be different from current password';
      } else {
        this.newPasswordError = '';
      }
      this.validatePasswordMatch();
    },
    
    validatePasswordMatch() {
      if (this.newPassword && this.confirmPassword && this.newPassword !== this.confirmPassword) {
        this.confirmPasswordError = 'Passwords do not match';
      } else {
        this.confirmPasswordError = '';
      }
    },
    
    async updatePassword() {
      if (!this.isPasswordFormValid) return;
      
      this.updatingPassword = true;
      this.errorMessage = '';
      
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        // Reauthenticate user
        const credential = EmailAuthProvider.credential(
          user.email,
          this.currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, this.newPassword);
        
        // Clear form
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        
        this.showSuccess('Password updated successfully!');
      } catch (error) {
        console.error('Error updating password:', error);
        if (error.code === 'auth/requires-recent-login') {
          this.errorMessage = 'This operation requires recent authentication. Please log out and log back in.';
        } else {
          this.errorMessage = this.getFirebaseError(error.code) || 'Failed to update password. Please try again.';
        }
      } finally {
        this.updatingPassword = false;
      }
    },
    
    // Utility Methods
    getFirebaseError(code) {
      switch(code) {
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/requires-recent-login':
          return 'This operation requires recent authentication. Please log out and log back in.';
        case 'auth/weak-password':
          return 'Password should be at least 6 characters.';
        default:
          return 'An error occurred. Please try again.';
      }
    },
    
    showSuccess(message) {
      this.successMessage = message;
      this.updateSuccess = true;
      setTimeout(() => {
        this.updateSuccess = false;
        this.successMessage = '';
      }, 3000);
    },
    
    logout() {
      const auth = getAuth();
      signOut(auth).then(() => {
        this.$router.push('/');
      }).catch((error) => {
        alert('Logout failed: ' + error.message);
      });
    }
  }
};
</script>

<style scoped>
/* Navbar Styles */
.navbar {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  padding: 0.8rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  text-decoration: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: translateY(-2px);
}

.logo i {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link, .logout-button, .login-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.back-to-discussions {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.back-to-discussions:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-greeting {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.initials-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid white;
}

.logout-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  cursor: pointer;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.login-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.login-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* Profile Content Styles */
.profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  padding-bottom: 1rem;
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(to right, #3498db, #9b59b6);
}

.profile-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.avatar-wrapper .initials-avatar {
  width: 100px;
  height: 100px;
  font-size: 2rem;
  border-width: 3px;
}

.avatar-color-picker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1rem;
}

.avatar-color-picker p {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
  max-width: 300px;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #2c3e50;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #3498db;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  padding: 1.5rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.form-section h2 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-section h2 i {
  color: #3498db;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: white;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.save-btn {
  background: linear-gradient(135deg, #3498db, #2ecc71);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2980b9, #27ae60);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #95a5a6;
}

.success-message {
  color: #27ae60;
  margin-top: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background-color: rgba(39, 174, 96, 0.1);
  border-radius: 8px;
}

.error-message {
  color: #e74c3c;
  margin-top: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
}

.field-error {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .navbar {
    padding: 0.8rem 1rem;
  }
  
  .logo {
    font-size: 1.5rem;
  }
  
  .nav-links {
    gap: 0.8rem;
  }
  
  .nav-link span, 
  .logout-button span,
  .login-button span,
  .user-greeting span {
    display: none;
  }
  
  .nav-link i,
  .logout-button i,
  .login-button i {
    margin-right: 0;
    font-size: 1.1rem;
  }
  
  .user-greeting {
    gap: 0.5rem;
  }
  
  .initials-avatar {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    transition: all 0.3s ease;
  }

  .profile-content {
    padding: 1rem;
  }
  
  .profile-card {
    padding: 1.5rem;
  }
  
  .form-section {
    padding: 1rem;
  }
  
  .form-section h2 {
    font-size: 1.1rem;
  }
  
  .color-option {
    width: 25px;
    height: 25px;
  }
}
</style>