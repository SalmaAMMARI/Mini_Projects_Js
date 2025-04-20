<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>Profile Page</h2>
      <div class="status-indicator">
        <span class="status-label">Status:</span>
        <span class="status-value" :class="{ 'online': isOnline }">
          {{ isOnline ? 'Online' : 'Offline' }}
        </span>
      </div>
    </div>
    
    <div class="profile-form">
      <div class="profile-picture-section">
        <div class="profile-picture-container">
          <img 
            :src="profileImageUrl || '/default-avatar.png'" 
            alt="Profile Picture" 
            class="profile-picture"
            @error="handleImageError"
          />
          <div v-if="isUploading" class="upload-overlay">
            <div class="upload-progress">{{ uploadProgress }}%</div>
          </div>
        </div>
        
        <div class="profile-picture-actions">
          <!-- Image URL input form -->
          <div class="image-url-form">
            <input 
              type="text" 
              v-model="imageUrlInput" 
              placeholder="Enter image URL" 
              class="image-url-input"
            >
            <button 
              @click="setImageFromUrl" 
              class="url-button"
              :disabled="isUploading || !imageUrlInput"
            >
              Set Image
            </button>
          </div>
          
          <div class="or-divider">- OR -</div>
          
          <label for="profilePicture" class="upload-button">
            <span class="upload-icon">📷</span> Choose Photo
          </label>
          <input 
            id="profilePicture" 
            type="file" 
            accept="image/*" 
            @change="handleImageUpload" 
            class="file-input"
          >
          <button 
            v-if="profileImageUrl" 
            @click="removeProfilePicture" 
            class="remove-button"
            :disabled="isUploading"
          >
            Remove Photo
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label for="firstName">First Name</label>
        <input
          id="firstName"
          type="text"
          v-model="FirstName"
          :placeholder="FirstName || 'Enter your first name'"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input 
          id="lastName"
          type="text" 
          v-model="LastName" 
          :placeholder="LastName || 'Enter your last name'"
          required
        >
      </div>
      
      <div class="form-group">
        <label for="currentPassword">Current Password</label>
        <input 
          id="currentPassword"
          type="password" 
          v-model="oldPass" 
          placeholder="Enter current password"
        >
      </div>
      
      <div class="form-group">
        <label for="newPassword">New Password</label>
        <input 
          id="newPassword"
          type="password" 
          v-model="newPass" 
          placeholder="Enter new password"
        >
      </div>
      
      <div class="form-group">
        <label for="newEmail">Email</label>
        <p class="email-help">Type new email here if you want to change yours</p>
        <input
          id="newEmail" 
          type="email" 
          v-model="newEmail" 
          :placeholder="Email"
        >
      </div>
      
      <div class="form-actions">
        <button @click="updateProfile" class="save-button" :disabled="isUploading">Save Changes</button>
      </div>
      
      
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
    
    <div class="navigation-links">
      <router-link :to="`/forum/${userId}`" class="back-link">
        <span class="back-icon">←</span> Return to Discussions
      </router-link>
    </div>
  </div>
</template>

<script>
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateEmail,
  sendEmailVerification,
  updateProfile as updateAuthProfile
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: "ProfilePage",
  setup() {
    const route = useRoute();
    const FirstName = ref('');
    const LastName = ref('');
    const oldPass = ref('');
    const newPass = ref('');
    const newEmail = ref('');
    const userId = ref(null);
    const successMessage = ref('');
    const errorMessage = ref('');
    const Email = ref('');
    const emailVerified = ref(false);
    const isOnline = ref(false);
    const profileImageUrl = ref('');
    const isUploading = ref(false);
    const uploadProgress = ref(0);
    const profileImagePath = ref('');
    const imageUrlInput = ref('');
    const isImageUrlInvalid = ref(false);
    
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        userId.value = currentUser?.uid || route.params.userid;
        
        if (!userId.value) {
          errorMessage.value = "No user ID found. Please log in.";
          return;
        }
        
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", userId.value));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          FirstName.value = userData.FirstName || '';
          LastName.value = userData.LastName || '';
          Email.value = userData.Email || currentUser?.email || '';
          isOnline.value = userData.isOnline || false;
          
          // Only set the profile image URL if it exists in the database
          if (userData.profileImageUrl) {
            profileImageUrl.value = userData.profileImageUrl;
            profileImagePath.value = userData.profileImagePath || '';
          }
          
          emailVerified.value = currentUser?.emailVerified || false;
        } else if (currentUser) {
          // Initialize user document if it doesn't exist
          await setDoc(doc(db, 'users', userId.value), {
            FirstName: '',
            LastName: '',
            Email: currentUser.email,
            isOnline: true,
            profileImageUrl: '',
            profileImagePath: '',
            createdAt: new Date()
          });
          
          Email.value = currentUser.email;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        errorMessage.value = "Failed to fetch user data: " + error.message;
      }
    };
    
    // Function to handle setting image from URL
    const setImageFromUrl = async () => {
      if (!imageUrlInput.value) return;
      
      try {
        successMessage.value = '';
        errorMessage.value = '';
        isUploading.value = true;
        
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          errorMessage.value = "You must be logged in to update your profile";
          isUploading.value = false;
          return;
        }
        
        // Validate URL format
        try {
          new URL(imageUrlInput.value);
        } catch (e) {
          errorMessage.value = "Please enter a valid URL";
          isUploading.value = false;
          return;
        }
        
        // If there's an existing image in storage, delete it
        if (profileImagePath.value && profileImagePath.value.startsWith('profile_pictures/')) {
          try {
            const storage = getStorage();
            const oldImageRef = storageRef(storage, profileImagePath.value);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error("Failed to delete old image:", error);
            // Continue even if delete fails
          }
        }
        
        // Update Auth profile if available
        try {
          await updateAuthProfile(currentUser, {
            photoURL: imageUrlInput.value
          });
        } catch (authError) {
          console.error("Failed to update auth profile:", authError);
          // Continue even if this fails
        }
        
        // Update user profile in Firestore
        const db = getFirestore();
        await updateDoc(doc(db, 'users', userId.value), {
          profileImageUrl: imageUrlInput.value,
          profileImagePath: 'external_url', // Mark as external URL
          updatedAt: new Date()
        });
        
        profileImageUrl.value = imageUrlInput.value;
        profileImagePath.value = 'external_url';
        successMessage.value = "Profile picture updated successfully!";
        
        // Clear the input
        imageUrlInput.value = '';
        
      } catch (error) {
        console.error("Set image URL error:", error);
        errorMessage.value = "Failed to set profile picture: " + error.message;
      } finally {
        isUploading.value = false;
      }
    };
    
    // Handle image error when loading invalid URLs
    const handleImageError = (event) => {
      if (profileImageUrl.value) {
        errorMessage.value = "Failed to load image. The URL may be invalid or inaccessible.";
        // Don't reset the profile image URL here, just show an error
        isImageUrlInvalid.value = true;
      }
    };
    
    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        errorMessage.value = "Please upload a valid image file (JPEG, PNG, GIF, WEBP)";
        return;
      }
      
     
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        errorMessage.value = "Image size must be less than 5MB";
        return;
      }
      
      try {
        isUploading.value = true;
        uploadProgress.value = 0;
        successMessage.value = '';
        errorMessage.value = '';
        
        const storage = getStorage();
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          errorMessage.value = "You must be logged in to upload an image";
          isUploading.value = false;
          return;
        }
        
        // Delete previous image if exists in storage
        if (profileImagePath.value && profileImagePath.value.startsWith('profile_pictures/')) {
          try {
            const oldImageRef = storageRef(storage, profileImagePath.value);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error("Failed to delete old image:", error);
            // Continue with upload even if delete fails
          }
        }
        
        // Create a unique filename with timestamp to prevent cache issues
        const fileExtension = file.name.split('.').pop();
        const filename = `${userId.value}_${Date.now()}.${fileExtension}`;
        const storagePath = `profile_pictures/${filename}`;
        
        // Upload the file to Firebase Storage
        const imageRef = storageRef(storage, storagePath);
        const uploadTask = uploadBytesResumable(imageRef, file);
        
        uploadTask.on(
          'state_changed', 
          (snapshot) => {
            // Track upload progress
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            uploadProgress.value = progress;
          },
          (error) => {
            console.error("Upload error:", error);
            errorMessage.value = "Failed to upload image: " + error.message;
            isUploading.value = false;
          },
          async () => {
            // Upload completed successfully
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Update user profile in Auth (if available)
              try {
                await updateAuthProfile(currentUser, {
                  photoURL: downloadUrl
                });
              } catch (authError) {
                console.error("Failed to update auth profile:", authError);
                // Continue even if this fails
              }
              
              // Update user profile in Firestore
              const db = getFirestore();
              await updateDoc(doc(db, 'users', userId.value), {
                profileImageUrl: downloadUrl,
                profileImagePath: storagePath,
                updatedAt: new Date()
              });
              
              // Only update local state when upload is successful
              profileImageUrl.value = downloadUrl;
              profileImagePath.value = storagePath;
              successMessage.value = "Profile picture updated successfully!";
            } catch (finalError) {
              console.error("Error in final upload step:", finalError);
              errorMessage.value = "Failed to complete the upload: " + finalError.message;
            } finally {
              isUploading.value = false;
            }
          }
        );
      } catch (error) {
        console.error("Upload handler error:", error);
        errorMessage.value = "Failed to process image: " + error.message;
        isUploading.value = false;
      }
    };
    
    const removeProfilePicture = async () => {
      if (isUploading.value) return;
      
      try {
        successMessage.value = '';
        errorMessage.value = '';
        
        if (!profileImageUrl.value) {
          errorMessage.value = "No profile picture to remove";
          return;
        }
        
        isUploading.value = true;
        
        const storage = getStorage();
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        // Delete the image from Firebase Storage if it's stored there
        if (profileImagePath.value && profileImagePath.value.startsWith('profile_pictures/')) {
          try {
            const imageRef = storageRef(storage, profileImagePath.value);
            await deleteObject(imageRef);
          } catch (storageError) {
            console.error("Error deleting storage image:", storageError);
            // Continue even if storage deletion fails
          }
        }
        
        // Update Auth profile if available
        if (currentUser) {
          try {
            await updateAuthProfile(currentUser, {
              photoURL: null
            });
          } catch (authError) {
            console.error("Error updating auth profile:", authError);
            // Continue even if this fails
          }
        }
        
        // Update the user profile in Firestore
        const db = getFirestore();
        await updateDoc(doc(db, 'users', userId.value), {
          profileImageUrl: '',
          profileImagePath: '',
          updatedAt: new Date()
        });
        
        // Clear the local state
        profileImageUrl.value = '';
        profileImagePath.value = '';
        successMessage.value = "Profile picture removed successfully!";
      } catch (error) {
        console.error("Remove profile picture error:", error);
        errorMessage.value = "Failed to remove profile picture: " + error.message;
      } finally {
        isUploading.value = false;
      }
    };
    
    // Validate an email address format
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    const updateProfile = async () => {
      if (isUploading.value) return;
      
      try {
        successMessage.value = '';
        errorMessage.value = '';
        
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          errorMessage.value = "You must be logged in to update your profile";
          return;
        }
        
        
        if (!FirstName.value.trim() || !LastName.value.trim()) {
          errorMessage.value = "First and last name are required";
          return;
        }
        
        const db = getFirestore();
        
        // Update profile data in Firestore WITHOUT changing the profile image
        const updateData = {
          FirstName: FirstName.value.trim(),
          LastName: LastName.value.trim(),
          isOnline: true,
          updatedAt: new Date()
        };
        
        
        await updateDoc(doc(db, 'users', userId.value), updateData);
        
        
        if (oldPass.value) {
          // Re-authenticate first (required for both password and email change)
          try {
            const credential = EmailAuthProvider.credential(currentUser.email, oldPass.value);
            await reauthenticateWithCredential(currentUser, credential);
            
            // Handle password change if requested
            if (newPass.value) {
              if (newPass.value.length < 6) {
                errorMessage.value = "Password must be at least 6 characters";
                return;
              }
              await updatePassword(currentUser, newPass.value);
              oldPass.value = '';
              newPass.value = '';
              successMessage.value = "Password updated successfully!";
            }
            
            // Handle email change if requested
            if (newEmail.value && newEmail.value !== currentUser.email) {
              // Validate email format
              if (!isValidEmail(newEmail.value)) {
                errorMessage.value = "Please enter a valid email address";
                return;
              }
              
              // Update the email directly first - this will update auth credentials
              await updateEmail(currentUser, newEmail.value);
              
              // Then send verification email
              await sendEmailVerification(currentUser);
              
              // Then update Firestore immediately, so they match
              await updateDoc(doc(db, 'users', userId.value), {
                Email: newEmail.value,
                updatedAt: new Date()
              });
              
              // Update the local state
              Email.value = newEmail.value;
              
              successMessage.value = successMessage.value 
                ? successMessage.value + " Email updated successfully! Verification email sent."
                : "Email updated successfully! Verification email sent.";
              
              newEmail.value = '';
            }
          } catch (authError) {
            console.error("Authentication error:", authError);
            errorMessage.value = "Authentication failed: " + authError.message;
            return;
          }
        } else if (newPass.value || newEmail.value) {
          errorMessage.value = "Current password is required to change password or email";
          return;
        }
        
        if (!successMessage.value) {
          successMessage.value = "Profile updated successfully!";
        }
      } catch (error) {
        console.error("Update profile error:", error);
        errorMessage.value = "Failed to update profile: " + error.message;
      }
    };
    
    // Initialize user data when component mounts
    onMounted(async () => {
      await fetchUserData();
    });
    
    return {
      FirstName,
      LastName,
      oldPass,
      newPass,
      newEmail,
      userId,
      successMessage,
      errorMessage,
      Email,
      emailVerified,
      isOnline,
      profileImageUrl,
      isUploading,
      uploadProgress,
      imageUrlInput,
      updateProfile,
      handleImageUpload,
      removeProfilePicture,
      setImageFromUrl,
      handleImageError
    };
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.profile-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.status-indicator {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  padding: 8px 16px;
  border-radius: 20px;
}

.status-label {
  font-weight: 500;
  margin-right: 8px;
  color: #555;
}

.status-value {
  font-weight: 600;
  color: #999;
}

.status-value.online {
  color: #4caf50;
}

.profile-form {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* Profile Picture Styles */
.profile-picture-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.profile-picture-container {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.upload-progress {
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.profile-picture-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 300px;
}

/* Image URL input styles */
.image-url-form {
  display: flex;
  width: 100%;
  gap: 8px;
}

.image-url-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.image-url-input:focus {
  border-color: #1976d2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.url-button {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.url-button:hover:not(:disabled) {
  background-color: #1e88e5;
}

.url-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.or-divider {
  color: #777;
  margin: 4px 0;
  font-size: 14px;
}

.file-input {
  display: none;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  background-color: #1976d2;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.upload-button:hover {
  background-color: #1565c0;
}

.upload-icon {
  margin-right: 6px;
}

.remove-button {
  background-color: transparent;
  border: 1px solid #f44336;
  color: #f44336;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.remove-button:hover:not(:disabled) {
  background-color: #ffebee;
}

.remove-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus {
  border-color: #1976d2;
  outline: none;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.email-help {
  margin: 4px 0 8px;
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.form-actions {
  margin-top: 30px;
}

.save-button {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: #1565c0;
  transform: translateY(-1px);
}

.save-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.success-message {
  margin-top: 20px;
  padding: 12px;
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 6px;
  border-left: 4px solid #4caf50;
}

.error-message {
  margin-top: 20px;
  padding: 12px;
  background-color: #ffebee;
  color: #c62828;
  border-radius: 6px;
  border-left: 4px solid #f44336;
}

.navigation-links {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.back-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #1976d2;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.back-link:hover {
  background-color: #e3f2fd;
}

.back-icon {
  margin-right: 8px;
}
</style>