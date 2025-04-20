<template>
  <div class="forum-layout">
    <!-- Top Navigation Bar -->
    <div class="top-nav">
      <div class="user-info">
        <router-link :to="`/profile/${userId}`" class="profile-link">
          <img :src="profileImageUrl || '/api/placeholder/32/32'" alt="Profile" class="profile-image" />
          <span class="username">{{ FirstName }} {{ LastName }}</span>
          <span class="status-dot" :class="{ 'online': isOnline }"></span>
        </router-link>
      </div>
      <button @click="logout" class="logout-btn">Déconnexion</button>
    </div>
    
    <div class="forum-content">
      <div class="left-panel">
        <!-- Create Discussion Buttons -->
        <div class="create-buttons">
          <button @click="openCreatePrivateDialog" class="create-button private-btn">
            <span class="icon">+</span> Créer une discussion privée
          </button>
          <button @click="openCreatePublicDialog" class="create-button public-btn">
            <span class="icon">+</span> Créer une discussion publique
          </button>
        </div>
        
        <!-- Filter Buttons -->
        <div class="filter-buttons">
          <button @click="showAll" :class="{ active: filterType === 'all' }">Tous</button>
          <button @click="showPrivate" :class="{ active: filterType === 'private' }">Privés</button>
          <button @click="showPublic" :class="{ active: filterType === 'public' }">Publics</button>
        </div>
        
        <!-- Discussions List -->
        <SingleDisc
          v-for="disc in filteredDiscussions"
          :key="disc.id"
          :discussion-id="disc.id"
          :is-participant="isParticipant(disc)"
          :is-active="currentDiscussionId === disc.id"
          :creator-pic="disc.creatorPic"
          @view-discussion="handleViewDiscussion"
          @join-discussion="joinDiscussion"
          @leave-discussion="leaveDiscussion"
        />
      </div>
      
      <div class="right-panel" v-if="currentDiscussionId && canViewDiscussion">
        <Responses 
          :discussionId="currentDiscussionId"
          @hide-discussion="hideDiscussion"
        />
      </div>
      <div v-else-if="currentDiscussionId && !canViewDiscussion" class="right-panel join-prompt">
        <h3>Vous n'êtes pas un participant de cette discussion</h3>
        <p>Pour voir les détails et participer, veuillez rejoindre la discussion.</p>
        <button @click="joinDiscussion(currentDiscussionId)" class="join-button">Rejoindre la discussion</button>
      </div>
      <div class="right-panel" v-else>
        Sélectionnez une discussion pour voir les réponses
      </div>
    </div>
    
    <!-- Modal pour création de discussion privée -->
    <div v-if="showPrivateDialog" class="modal">
      <div class="modal-content">
        <h3>Créer une discussion privée</h3>
        <input v-model="newDiscPrivateTitle" placeholder="Titre de la discussion" />
        <textarea v-model="newDiscPrivateDescription" placeholder="Description" rows="3"></textarea>
        <input v-model="newDiscParticipantEmail" placeholder="Email du participant" />
        <div class="modal-buttons">
          <button @click="createPrivateDiscussion">Créer</button>
          <button @click="closeModals">Annuler</button>
        </div>
      </div>
    </div>
    
    <!-- Modal pour création de discussion publique -->
    <div v-if="showPublicDialog" class="modal">
      <div class="modal-content">
        <h3>Créer une discussion publique</h3>
        <input v-model="newDiscPublicTitle" placeholder="Titre de la discussion" />
        <textarea v-model="newDiscPublicDescription" placeholder="Description" rows="3"></textarea>
        <!-- New input field for discussion image URL -->
        <input v-model="newDiscPublicImageUrl" placeholder="URL de l'image (https://...)" />
        <div class="image-preview" v-if="newDiscPublicImageUrl">
          <img :src="newDiscPublicImageUrl || '/api/placeholder/100/100'" alt="Preview" class="preview-image" />
        </div>
        <div class="participant-emails">
          <input 
            v-model="newParticipantEmail" 
            placeholder="Email d'un participant (optionnel)" 
            @keyup.enter="addParticipantEmail"
          />
          <button @click="addParticipantEmail">Ajouter</button>
        </div>
        <div class="email-list" v-if="participantEmails.length > 0">
          <div v-for="(email, index) in participantEmails" :key="index" class="email-tag">
            {{ email }}
            <span class="remove-email" @click="removeParticipantEmail(index)">×</span>
          </div>
        </div>
        <div class="modal-buttons">
          <button @click="createPublicDiscussion">Créer</button>
          <button @click="closeModals">Annuler</button>
        </div>
      </div>
    </div>
    
    <!-- Modal pour mettre à jour la photo de profil -->
    <div v-if="showProfilePicDialog" class="modal">
      <div class="modal-content">
        <h3>Mettre à jour votre photo de profil</h3>
        <input v-model="profilePicInput" placeholder="URL de l'image (https://...)" />
        <div class="profile-pic-preview">
          <img :src="profilePicInput || profileImageUrl || '/api/placeholder/100/100'" alt="Preview" class="preview-image" />
        </div>
        <div class="modal-buttons">
          <button @click="updateProfilePicture">Sauvegarder</button>
          <button @click="closeProfilePicDialog">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, arrayUnion, arrayRemove, getDoc, addDoc, where, serverTimestamp } from "firebase/firestore";
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import SingleDisc from "../components/singleDisc.vue";
import Responses from "../components/Responses.vue";

export default {
  name: "Forum",
  components: {
    SingleDisc,
    Responses
  },
  emits: ['select-discussion'],
  setup(props, { emit }) {
    const router = useRouter();
    const userId = ref(null);
    const userEmail = ref(null);
    const FirstName = ref('');
    const LastName = ref('');
    const isOnline = ref(false);
    const profileImageUrl = ref('');
    const discussions = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const filterType = ref('all');
    const currentDiscussionId = ref(null);
    const canViewDiscussion = ref(false);
    
    // Pour la photo de profil
    const showProfilePicDialog = ref(false);
    const profilePicInput = ref('');
    
    // Pour créer une discussion privée
    const showPrivateDialog = ref(false);
    const newDiscPrivateTitle = ref('');
    const newDiscPrivateDescription = ref('');
    const newDiscParticipantEmail = ref('');
    
    // Pour créer une discussion publique
    const showPublicDialog = ref(false);
    const newDiscPublicTitle = ref('');
    const newDiscPublicDescription = ref('');
    const newDiscPublicImageUrl = ref(''); // New field for discussion image URL
    const newParticipantEmail = ref('');
    const participantEmails = ref([]);
    
    // Fetch user data including name, online status, and profile picture
    const fetchUserData = async (uid) => {
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", uid));
        
        if (userDoc.exists()) {
          FirstName.value = userDoc.data().FirstName || '';
          LastName.value = userDoc.data().LastName || '';
          isOnline.value = userDoc.data().isOnline || false;
          profileImageUrl.value = userDoc.data().profileImageUrl || '';
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    // Open profile picture update dialog
    const openProfilePicDialog = () => {
      if (!userId.value) {
        alert("Vous devez être connecté pour modifier votre photo de profil.");
        return;
      }
      profilePicInput.value = profileImageUrl.value || '';
      showProfilePicDialog.value = true;
    };
    
    // Close profile picture dialog
    const closeProfilePicDialog = () => {
      showProfilePicDialog.value = false;
      profilePicInput.value = '';
    };
    
    // Update profile picture
    const updateProfilePicture = async () => {
      if (!userId.value) {
        alert("Vous devez être connecté pour modifier votre photo de profil.");
        return;
      }
      
      try {
        const db = getFirestore();
        await updateDoc(doc(db, "users", user.uid), {
          profileImageUrl: profilePicInput.value
        });
        
        profileImageUrl.value = profilePicInput.value;
        closeProfilePicDialog();
        alert("Photo de profil mise à jour avec succès!");
      } catch (error) {
        console.error("Error updating profile picture:", error);
        alert("Erreur lors de la mise à jour de la photo de profil.");
      }
    };
    
    // Logout function
    const logout = async () => {
      try {
        const auth = getAuth();
        const db = getFirestore();
        
        // Set the user's online status to false in Firestore
        if (userId.value) {
          await updateDoc(doc(db, "users", userId.value), {
            isOnline: false
          });
        }
        
        // Sign out from Firebase Auth
        await signOut(auth);
        
        // Redirect to home page
        router.push('/');
      } catch (error) {
        console.error("Error logging out:", error);
        alert("Une erreur s'est produite lors de la déconnexion");
      }
    };
    
    const fetchDiscussions = async () => {
      try {
        loading.value = true;
        const db = getFirestore();
        const discussionsQuery = query(
          collection(db, "discussions"),
          orderBy("createdAt", "desc")
        );
        
        const querySnapshot = await getDocs(discussionsQuery);
        
        // Get all user data to fetch creator profile pictures
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(usersRef);
        const usersMap = {};
        
        usersSnapshot.forEach(doc => {
          usersMap[doc.id] = doc.data();
        });
        
        // Process discussion data
        discussions.value = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          if (data.createdAt) {
            data.createdAtTimestamp = data.createdAt.toDate ? 
              data.createdAt.toDate().getTime() : 
              new Date(data.createdAt).getTime();
          }
          
          // Ensure participants is an array
          if (!data.participants) {
            data.participants = [];
          }
          
          // Add creator's profile picture if available
          if (data.createdBy && usersMap[data.createdBy]) {
            data.creatorPic = usersMap[data.createdBy].profileImageUrl || '';
          }
          
          return {
            id: doc.id,
            ...data
          };
        }));
        
        console.log("Fetched discussions:", discussions.value);
      } catch (err) {
        console.error("Failed to load discussions:", err);
        error.value = "Failed to load discussions: " + err.message;
      } finally {
        loading.value = false;
      }
    };
    
    const isParticipant = (discussion) => {
      return userId.value && discussion.participants && 
             Array.isArray(discussion.participants) && 
             discussion.participants.includes(userId.value);
    };
    
    const filteredDiscussions = computed(() => {
      if (!discussions.value.length) return [];
      
      // Filter out private discussions where user is not a participant
      const accessibleDiscussions = discussions.value.filter(disc => {
        // If private, only show if user is a participant
        if (disc.isPrivate === true) {
          return isParticipant(disc);
        }
        // If public, always show
        return true;
      });
      
      // Then apply type filter
      if (filterType.value === 'all') {
        return accessibleDiscussions;
      } else if (filterType.value === 'private') {
        return accessibleDiscussions.filter(disc => disc.isPrivate === true);
      } else if (filterType.value === 'public') {
        return accessibleDiscussions.filter(disc => disc.isPrivate === false);
      }
      
      return accessibleDiscussions;
    });
    
    const checkParticipantStatus = () => {
      if (!currentDiscussionId.value || !userId.value) {
        canViewDiscussion.value = false;
        return;
      }
      
      const currentDiscussion = discussions.value.find(d => d.id === currentDiscussionId.value);
      if (currentDiscussion) {
        canViewDiscussion.value = isParticipant(currentDiscussion);
      } else {
        canViewDiscussion.value = false;
      }
    };
    
    const joinDiscussion = async (discussionId) => {
      if (!userId.value) {
        alert("Vous devez être connecté pour rejoindre une discussion");
        return;
      }
      
      try {
        const db = getFirestore();
        const discussionRef = doc(db, 'discussions', discussionId);
        
        // Get the latest version of the document
        const discussionSnap = await getDoc(discussionRef);
        if (!discussionSnap.exists()) {
          throw new Error("Discussion not found");
        }
        
        // Update the document to add the user to participants
        await updateDoc(discussionRef, {
          participants: arrayUnion(userId.value)
        });
        
        // Update local state
        const discussionIndex = discussions.value.findIndex(d => d.id === discussionId);
        if (discussionIndex !== -1) {
          if (!discussions.value[discussionIndex].participants) {
            discussions.value[discussionIndex].participants = [];
          }
          
          if (!discussions.value[discussionIndex].participants.includes(userId.value)) {
            discussions.value[discussionIndex].participants.push(userId.value);
          }
        }
        
        // Update the view permission
        canViewDiscussion.value = true;
        
        console.log(`Successfully joined discussion ${discussionId}`);
      } catch (error) {
        console.error("Error joining discussion:", error);
        alert("Une erreur s'est produite lors de la tentative de rejoindre la discussion");
      }
    };

    const leaveDiscussion = async (discussionId, isPrivate) => {
      if (!userId.value) {
        alert("Vous devez être connecté pour quitter une discussion");
        return;
      }
      
      try {
        const db = getFirestore();
        const discussionRef = doc(db, 'discussions', discussionId);
        
        // Get the latest version of the document
        const discussionSnap = await getDoc(discussionRef);
        if (!discussionSnap.exists()) {
          throw new Error("Discussion not found");
        }
        
        // Update the document to remove the user from participants
        await updateDoc(discussionRef, {
          participants: arrayRemove(userId.value)
        });
        
        // Update local state
        const discussionIndex = discussions.value.findIndex(d => d.id === discussionId);
        if (discussionIndex !== -1 && discussions.value[discussionIndex].participants) {
          discussions.value[discussionIndex].participants = 
            discussions.value[discussionIndex].participants.filter(p => p !== userId.value);
        }
        
        // If this is the current discussion, hide it
        if (currentDiscussionId.value === discussionId) {
          hideDiscussion();
        }
        
        // For private discussions, they should disappear from the list after leaving
        if (isPrivate) {
          await fetchDiscussions(); // Refresh the list
        }
        
        console.log(`Successfully left discussion ${discussionId}`);
      } catch (error) {
        console.error("Error leaving discussion:", error);
        alert("Une erreur s'est produite lors de la tentative de quitter la discussion");
      }
    };
    
    const showAll = () => {
      filterType.value = 'all';
    };
    
    const showPrivate = () => {
      filterType.value = 'private';
    };
    
    const showPublic = () => {
      filterType.value = 'public';
    };
    
    const handleViewDiscussion = (discussionId) => {
      currentDiscussionId.value = discussionId;
      emit('select-discussion', discussionId);
      checkParticipantStatus();
    };
    
    const hideDiscussion = () => {
      currentDiscussionId.value = null;
      canViewDiscussion.value = false;
    };
    
    // Fonctions pour la création de discussion
    const openCreatePrivateDialog = () => {
      if (!userId.value) {
        alert("Vous devez être connecté pour créer une discussion.");
        return;
      }
      showPrivateDialog.value = true;
      showPublicDialog.value = false;
      showProfilePicDialog.value = false;
    };
    
    const openCreatePublicDialog = () => {
      if (!userId.value) {
        alert("Vous devez être connecté pour créer une discussion.");
        return;
      }
      showPublicDialog.value = true;
      showPrivateDialog.value = false;
      showProfilePicDialog.value = false;
    };
    
    const closeModals = () => {
      showPrivateDialog.value = false;
      showPublicDialog.value = false;
      newDiscPrivateTitle.value = '';
      newDiscPrivateDescription.value = '';
      newDiscParticipantEmail.value = '';
      newDiscPublicTitle.value = '';
      newDiscPublicDescription.value = '';
      newDiscPublicImageUrl.value = ''; // Reset the image URL field
      newParticipantEmail.value = '';
      participantEmails.value = [];
    };
    
    const addParticipantEmail = () => {
      if (newParticipantEmail.value && !participantEmails.value.includes(newParticipantEmail.value)) {
        participantEmails.value.push(newParticipantEmail.value);
        newParticipantEmail.value = '';
      }
    };
    
    const removeParticipantEmail = (index) => {
      participantEmails.value.splice(index, 1);
    };
    
    // FIXED: Improved email search for private discussions
    const createPrivateDiscussion = async () => {
      if (!userId.value) {
        alert("Vous devez être connecté pour créer une discussion.");
        return;
      }
      
      if (!newDiscPrivateTitle.value.trim()) {
        alert("Le titre de la discussion est obligatoire.");
        return;
      }
      
      const emailToFind = newDiscParticipantEmail.value.trim();
      if (!emailToFind) {
        alert("Veuillez spécifier un participant.");
        return;
      }
      
      try {
        // Chercher l'utilisateur par email - avec plus de robustesse
        const db = getFirestore();
        const usersRef = collection(db, "users");
        
        // Try different field names and case sensitivity options
        const emailFields = ["Email", "email", "userEmail"];
        let participantId = null;
        
        for (const field of emailFields) {
          if (participantId) break; // Skip if already found
          
          // Try case-sensitive search
          const q1 = query(usersRef, where(field, "==", emailToFind));
          const snap1 = await getDocs(q1);
          
          if (!snap1.empty) {
            snap1.forEach((doc) => {
              participantId = doc.id;
            });
            console.log(`Found user with ${field} (case-sensitive): ${participantId}`);
            break;
          }
          
          // Try lowercase search
          const q2 = query(usersRef, where(field, "==", emailToFind.toLowerCase()));
          const snap2 = await getDocs(q2);
          
          if (!snap2.empty) {
            snap2.forEach((doc) => {
              participantId = doc.id;
            });
            console.log(`Found user with ${field} (lowercase): ${participantId}`);
            break;
          }
        }
        
        // If still not found, try a different approach - fetch all users and compare
        if (!participantId) {
          console.log("User not found with direct queries, trying manual comparison");
          const allUsers = await getDocs(usersRef);
          
          allUsers.forEach((userDoc) => {
            const userData = userDoc.data();
            for (const key in userData) {
              // Check if any field contains an email that matches
              if (typeof userData[key] === 'string' && 
                  userData[key].toLowerCase() === emailToFind.toLowerCase() &&
                  userData[key].includes('@')) {
                participantId = userDoc.id;
                console.log(`Found user by manual search in field ${key}: ${participantId}`);
                break;
              }
            }
          });
        }
        
        if (!participantId) {
          alert("Utilisateur non trouvé avec cet email. Vérifiez l'adresse email et réessayez.");
          return;
        }
        
        // Créer la discussion
        const newDiscussion = {
          title: newDiscPrivateTitle.value.trim(),
          description: newDiscPrivateDescription.value.trim(),
          isPrivate: true,
          participants: [userId.value, participantId],
          createdAt: serverTimestamp(),
          createdBy: userId.value,
          creatorPic: profileImageUrl.value || ''
        };
        
        const docRef = await addDoc(collection(db, "discussions"), newDiscussion);
        
        // Ajouter la nouvelle discussion à la liste locale
        discussions.value.unshift({
          id: docRef.id,
          ...newDiscussion,
          createdAt: new Date() // Pour l'affichage immédiat, sera remplacé au prochain fetchDiscussions
        });
        
        alert("Discussion privée créée avec succès!");
        closeModals();
      } catch (err) {
        console.error("Erreur lors de la création de la discussion privée:", err);
        alert("Erreur lors de la création de la discussion. Veuillez réessayer.");
      }
    };
    
    // FIXED: Improved email search for public discussions too and added image URL
    const createPublicDiscussion = async () => {
      if (!userId.value) {
        alert("Vous devez être connecté pour créer une discussion.");
        return;
      }
      
      if (!newDiscPublicTitle.value.trim()) {
        alert("Le titre de la discussion est obligatoire.");
        return;
      }
      
      try {
        const db = getFirestore();
        
        // Récupérer les IDs des participants à partir des emails
        const participantIds = [userId.value]; // Toujours inclure l'utilisateur actuel
        const notFoundEmails = [];
        
        if (participantEmails.value.length > 0) {
          const usersRef = collection(db, "users");
          
          for (const email of participantEmails.value) {
            const emailToFind = email.trim();
            let found = false;
            
           
            const emailFields = ["Email", "email", "userEmail"];
            
            for (const field of emailFields) {
              if (found) break;
              
              // Try exact match
              const q = query(usersRef, where(field, "==", emailToFind));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                  if (!participantIds.includes(doc.id)) {
                    participantIds.push(doc.id);
                    found = true;
                  }
                });
              }
              
              // Try lowercase
              if (!found) {
                const q2 = query(usersRef, where(field, "==", emailToFind.toLowerCase()));
                const snap2 = await getDocs(q2);
                
                if (!snap2.empty) {
                  snap2.forEach((doc) => {
                    if (!participantIds.includes(doc.id)) {
                      participantIds.push(doc.id);
                      found = true;
                    }
                  });
                }
              }
            }
            
            // Manual search as fallback
            if (!found) {
              const allUsers = await getDocs(usersRef);
              allUsers.forEach((userDoc) => {
                const userData = userDoc.data();
                for (const key in userData) {
                  if (typeof userData[key] === 'string' && 
                      userData[key].toLowerCase() === emailToFind.toLowerCase() &&
                      userData[key].includes('@')) {
                    if (!participantIds.includes(userDoc.id)) {
                      participantIds.push(userDoc.id);
                      found = true;
                      break;
                    }
                  }
                }
              });
            }
            
            if (!found) {
              notFoundEmails.push(emailToFind);
            }
          }
        }
        
        // Warn about not found emails, but still create the discussion
        if (notFoundEmails.length > 0) {
          alert(`Attention: Les adresses emails suivantes n'ont pas été trouvées: ${notFoundEmails.join(", ")}`);
        }
        
        // Créer la discussion
        const newDiscussion = {
          title: newDiscPublicTitle.value.trim(),
          description: newDiscPublicDescription.value.trim(),
          isPrivate: false,
          participants: participantIds,
          createdAt: serverTimestamp(),
          createdBy: userId.value,
          creatorPic: profileImageUrl.value || '',
          profileImageUrl: newDiscPublicImageUrl.value || '' // Add the image URL to the discussion
        };
        
        const docRef = await addDoc(collection(db, "discussions"), newDiscussion);
        
        // Ajouter la nouvelle discussion à la liste locale
        discussions.value.unshift({
          id: docRef.id,
          ...newDiscussion,
          createdAt: new Date() // Pour l'affichage immédiat
        });
        
        alert("Discussion publique créée avec succès!");
        closeModals();
      } catch (err) {
        console.error("Erreur lors de la création de la discussion publique:", err);
        alert("Erreur lors de la création de la discussion. Veuillez réessayer.");
      }
    };
    
    onMounted(async () => {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          userId.value = user.uid;
          userEmail.value = user.email;
          
          // Set online status to true in Firestore
          const db = getFirestore();
          await updateDoc(doc(db, "users", user.uid), {
            isOnline: true
          });
          
          // Fetch user data including name and online status
          await fetchUserData(user.uid);
        } else {
          userId.value = null;
          userEmail.value = null;
          FirstName.value = '';
          LastName.value = '';
          isOnline.value = false;
          profileImageUrl.value = '';
        }
        checkParticipantStatus();
      });
      
      await fetchDiscussions();
    });
    
    return {
      userId,
      userEmail,
      FirstName,
      LastName,
      isOnline,
      profileImageUrl,
      discussions,
      loading,
      error,
      filteredDiscussions,
      logout,
      showAll,
      showPrivate,
      showPublic,
      handleViewDiscussion,
      hideDiscussion,
      currentDiscussionId,
      canViewDiscussion,
      isParticipant,
      joinDiscussion,
      leaveDiscussion,
      filterType,
      
      // Pour la photo de profil
      showProfilePicDialog,
      profilePicInput,
      openProfilePicDialog,
      closeProfilePicDialog,
      updateProfilePicture,
      
      // Pour création de discussion privée
      showPrivateDialog,
      newDiscPrivateTitle,
      newDiscPrivateDescription,
      newDiscParticipantEmail,
      openCreatePrivateDialog,
      createPrivateDiscussion,
      
      // Pour création de discussion publique
      showPublicDialog,
      newDiscPublicTitle,
      newDiscPublicDescription,
      newDiscPublicImageUrl, // New variable for discussion image URL
      newParticipantEmail,
      participantEmails,
      openCreatePublicDialog,
      createPublicDiscussion,
      addParticipantEmail,
      removeParticipantEmail,
      
      closeModals
    };
  }
};
</script>

<style scoped>
.forum-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}


.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
}

.profile-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 6px}
.forum-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}


.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
}

.profile-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.profile-link:hover {
  background-color: #f5f5f5;
}

.profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;}
.forum-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}


.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
}

.profile-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.profile-link:hover {
  background-color: #f5f5f5;
}

.profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
  border: 1px solid #e0e0e0;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
  margin-left: 8px;
}

.status-dot.online {
  background-color: #4caf50;
}

.logout-btn {
  background-color: #f5f5f5;
  color: #333;
  border: none;
  padding:}
.forum-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}


.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
}

.profile-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background-color 0.2s;
}

.profile-link:hover {
  background-color: #f5f5f5;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
  margin-left: 8px;
}

.status-dot.online {
  background-color: #4caf50;
}

.logout-btn {
  background-color: #f5f5f5;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #e0e0e0;
}


.forum-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.left-panel {
  width: 320px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.right-panel {
  flex: 1;
  background: #f5f7fb;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.right-panel > div:not(.join-prompt) {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.join-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  background: white;
  border-radius: 12px;
  padding: 40px;
}

.join-prompt h3 {
  color: #333;
  margin-bottom: 10px;
}

.join-prompt p {
  color: #666;
  margin-bottom: 20px;
}

.create-buttons {
  margin-bottom: 20px;
}

.create-button {
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.private-btn {
  background-color: #ffebee;
  color: #d32f2f;
}

.public-btn {
  background-color: #e3f2fd;
  color: #1976d2;
}

.private-btn:hover {
  background-color: #ffcdd2;
}

.public-btn:hover {
  background-color: #bbdefb;
}

.icon {
  font-size: 16px;
  margin-right: 8px;
  font-weight: bold;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-buttons button {
  flex: 1;
  padding: 8px;
  border: 1px solid #e0e0e0;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.filter-buttons button.active {
  background-color: #1976d2;
  color: white;
  border-color: #1976d2;
}


.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 18px;
}

.modal-content input,
.modal-content textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border 0.2s;
}

.modal-content input:focus,
.modal-content textarea:focus {
  border-color: #1976d2;
  outline: none;
}

.modal-content textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-buttons button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.modal-buttons button:first-child {
  background-color: #4caf50;
  color: white;
}

.modal-buttons button:first-child:hover {
  background-color: #3d8b40;
}

.modal-buttons button:last-child {
  background-color: #f5f5f5;
  color: #333;
}

.modal-buttons button:last-child:hover {
  background-color: #e0e0e0;
}

.participant-emails {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.participant-emails input {
  flex: 1;
}

.participant-emails button {
  padding: 0 16px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.email-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.email-tag {
  background-color: #e3f2fd;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.remove-email {
  margin-left: 6px;
  cursor: pointer;
  font-weight: bold;
  color: #1976d2;
}

.join-button {
  padding: 12px 24px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.join-button:hover {
  background-color: #1565c0;
  transform: translateY(-1px);
}


.loading {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

.no-discussions {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}
</style>