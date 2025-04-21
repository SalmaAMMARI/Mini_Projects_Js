<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">Create New Discussion</h2>
      
      <div v-if="error" class="auth-error">
        <i class="fas fa-exclamation-circle"></i> {{ error }}
      </div>
      
      <div class="auth-form-group">
        <label for="title">Discussion Title</label>
        <input
          id="title"
          v-model="title"
          type="text"
          class="auth-input"
          placeholder="Enter discussion title"
          required
        >
      </div>
      
      <div class="auth-form-group">
        <label for="content">Discussion Content</label>
        <textarea
          id="content"
          v-model="content"
          class="auth-input auth-textarea"
          placeholder="Write your discussion here..."
          required
        ></textarea>
      </div>
      
      <div class="auth-form-group">
        <label for="category">Category</label>
        <select
          id="category"
          v-model="category"
          class="auth-input"
        >
          <option value="General">General</option>
          <option value="Tech">Tech</option>
          <option value="Science">Science</option>
          <option value="Gaming">Gaming</option>
          <option value="Cooking">Cooking</option>
          <option value="Travel">Travel</option>
          <option value="Health">Health</option>
          <option value="Education">Education</option>
          <option value="Art">Art</option>
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
          <option value="Movies">Movies</option>
          <option value="Books">Books</option>
          <option value="Fashion">Fashion</option>
          <option value="Lifestyle">Lifestyle</option>
        </select>
      </div>
      
      <button
        @click="createDiscussion"
        :disabled="loading"
        class="auth-button"
      >
        <span v-if="!loading">Create Discussion</span>
        <span v-else><i class="fas fa-spinner fa-spin"></i> Creating...</span>
      </button>
      
      <router-link to="/forum" class="auth-link">
        <i class="fas fa-arrow-left"></i> Back to Forum
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import {initializeApp} from 'firebase/app';
import { addDoc, collection, serverTimestamp,getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'vue-router';
const firebaseConfig = {
  apiKey: "AIzaSyD6Ls27tC0PCig7KSVBBrAwYdJYukNPRQk",
  authDomain: "projectspd-c4560.firebaseapp.com",
  projectId: "projectspd-c4560",
  storageBucket: "projectspd-c4560.appspot.com",
  messagingSenderId: "161091067585",
  appId: "1:161091067585:web:7f9b054cc176805801fe40"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const db = getFirestore(app);

export default {
  name: 'NewDiscussionForm',
  setup() {
    const title = ref('');
    const content = ref('');
    const category = ref('General');
    const loading = ref(false);
    const error = ref(null);
    const router = useRouter();
    const auth = getAuth();

    const createDiscussion = async () => {
      try {
        // Reset error
        error.value = null;
        
        // Validate inputs
        if (!title.value.trim() || !content.value.trim()) {
          error.value = 'Please fill in all fields';
          return;
        }

        // Check if user is logged in
        const user = auth.currentUser;
        if (!user) {
          error.value = 'You must be logged in to create a discussion';
          return;
        }

        loading.value = true;

        // Add new discussion to Firestore
        await addDoc(collection(db, 'discussions'), {
          title: title.value,
          content: content.value,
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous',
          createdAt: serverTimestamp(),
          category: category.value,
          upvotes: 0,
          replies: 0
        });

        // Redirect to forum after successful creation
        router.push('/forum');
      } catch (err) {
        console.error('Error creating discussion:', err);
        error.value = 'Failed to create discussion. Please try again.';
      } finally {
        loading.value = false;
      }
    };

    return {
      title,
      content,
      category,
      loading,
      error,
      createDiscussion
    };
  }
};
</script>


<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
}

.auth-title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.auth-form-group {
  margin-bottom: 1.5rem;
}

.auth-form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.auth-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.auth-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.auth-textarea {
  min-height: 150px;
  resize: vertical;
}

.auth-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #2980b9, #27ae60);
}
.auth-button {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #3498db, #2ecc71);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-link {
  display: inline-block;
  margin-top: 1.5rem;
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  text-align: center;
  width: 100%;
}

.auth-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

.auth-error {
  background-color: #fdecea;
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
}
</style>