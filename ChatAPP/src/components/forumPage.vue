<template>
  <div class="discussions-container">
    <h1 class="discussions-title">Mes discussions</h1>
    
    <div v-if="loading" class="loading-indicator">
      <div class="spinner"></div>
      <span>Chargement des discussions...</span>
    </div>
    
    <div v-else-if="discussions.length === 0" class="no-discussions">
      <p>Vous n'avez pas encore de discussions.</p>
      <button @click="createNewDiscussion" class="create-discussion-btn">
        Créer une nouvelle discussion
      </button>
    </div>
    
    <div v-else class="discussions-list">
      <div 
        v-for="discussion in discussions" 
        :key="discussion.id" 
        class="discussion-item"
        :class="{'selected': selectedDiscussionId === discussion.id}"
        @click="selectDiscussion(discussion.id)"
      >
        <div class="discussion-profile-image" v-if="discussion.profileImageUrl">
          <img :src="discussion.profileImageUrl" alt="Profile" />
        </div>
        <div class="discussion-content">
          <h3 class="discussion-title">{{ discussion.title }}</h3>
          <p class="discussion-description">{{ discussion.description }}</p>
          
          <div class="discussion-meta">
            <span class="message-count">
              {{ discussion.messageCount || 0 }} message{{ discussion.messageCount !== 1 ? 's' : '' }}
            </span>
            <span class="discussion-date" v-if="discussion.lastActivity">
              {{ formatDate(discussion.lastActivity) }}
            </span>
          </div>
        </div>
        
        <!-- Status indicators -->
        <div class="participants-preview" v-if="discussionStatuses[discussion.id]">
          <div v-for="(userId, index) in getTopParticipants(discussion.id, 3)" 
               :key="userId"
               class="participant-indicator"
               :style="{ zIndex: 10 - index }">
            <div class="participant-avatar">
              {{ getInitials(userNames[userId] || '?') }}
              <span 
                class="status-dot"
                :class="{ 'online': isUserOnline(discussion.id, userId) }"
              ></span>
            </div>
          </div>
          <div class="more-participants" v-if="discussion.participants && discussion.participants.length > 3">
            +{{ discussion.participants.length - 3 }}
          </div>
        </div>
      </div>
    </div>
    
    <button @click="createNewDiscussion" class="new-discussion-btn">
      <span class="plus-icon">+</span>
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy,
  getDocs,
  onSnapshot, 
  doc, 
  getDoc, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  emits: ['select-discussion'],
  
  setup(props, { emit }) {
    const discussions = ref([]);
    const loading = ref(true);
    const selectedDiscussionId = ref(null);
    const discussionStatuses = ref({});
    const userNames = ref({});
    
    // Charger les discussions
    const loadDiscussions = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        loading.value = false;
        return;
      }
      
      try {
        const db = getFirestore();
        const discussionsQuery = query(
          collection(db, 'discussions'),
          orderBy('lastActivity', 'desc')
        );
        
        onSnapshot(discussionsQuery, async (snapshot) => {
          const discussionsList = [];
          
          for (const doc of snapshot.docs) {
            const data = doc.data();
            
            // Vérifier si l'utilisateur actuel fait partie de cette discussion
            if (data.participants && data.participants.includes(currentUser.uid)) {
              
              // Compter les messages
              let messageCount = 0;
              try {
                const messagesQuery = collection(db, 'discussions', doc.id, 'messages');
                const messagesSnapshot = await getDocs(messagesQuery);
                messageCount = messagesSnapshot.size;
              } catch (error) {
                console.error("Erreur lors du comptage des messages:", error);
              }
              
              discussionsList.push({
                id: doc.id,
                title: data.title,
                description: data.description,
                participants: data.participants || [],
                lastActivity: data.lastActivity,
                messageCount,
                profileImageUrl: data.profileImageUrl || null  // Ajouter le profileImageUrl
              });
              
              // Charger les noms des participants s'ils ne sont pas déjà chargés
              if (data.participants) {
                for (const userId of data.participants) {
                  if (!userNames.value[userId]) {
                    await getUserName(userId);
                  }
                }
              }
            }
          }
          
          discussions.value = discussionsList;
          loading.value = false;
        }, (error) => {
          console.error("Erreur lors du chargement des discussions:", error);
          loading.value = false;
        });
        
      } catch (error) {
        console.error("Erreur lors du chargement des discussions:", error);
        loading.value = false;
      }
    };
    
    // Charger le nom d'un utilisateur
    const getUserName = async (userId) => {
      if (userNames.value[userId]) return;
      
      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          userNames.value[userId] = fullName || userData.displayName || userData.email || 'Utilisateur';
        } else {
          // Vérifier si c'est l'utilisateur actuel
          const auth = getAuth();
          const currentUser = auth.currentUser;
          
          if (currentUser && currentUser.uid === userId) {
            userNames.value[userId] = currentUser.displayName || currentUser.email || 'Moi';
          } else {
            userNames.value[userId] = 'Utilisateur';
          }
        }
      } catch (error) {
        console.error(`Erreur lors du chargement de l'utilisateur ${userId}:`, error);
        userNames.value[userId] = 'Utilisateur';
      }
    };
    
    // Formater la date
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      
      try {
        // Handle both Firestore timestamp objects and raw timestamps
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) return '';
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const isToday = date.getDate() === today.getDate() && 
                       date.getMonth() === today.getMonth() && 
                       date.getFullYear() === today.getFullYear();
                         
        const isYesterday = date.getDate() === yesterday.getDate() && 
                          date.getMonth() === yesterday.getMonth() && 
                          date.getFullYear() === yesterday.getFullYear();
        
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        
        if (isToday) {
          return `Aujourd'hui, ${date.toLocaleTimeString('fr-FR', timeOptions)}`;
        } else if (isYesterday) {
          return `Hier, ${date.toLocaleTimeString('fr-FR', timeOptions)}`;
        } else {
          const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
          return date.toLocaleDateString('fr-FR', options) + ', ' + 
                date.toLocaleTimeString('fr-FR', timeOptions);
        }
      } catch (e) {
        console.error("Error formatting date:", e);
        return '';
      }
    };
    
    // Créer une nouvelle discussion
    const createNewDiscussion = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        alert("Vous devez être connecté pour créer une discussion");
        return;
      }
      
      const title = prompt("Titre de la discussion:");
      if (!title) return;
      
      const description = prompt("Description (optionnelle):");
      
      // Demander l'URL de l'image de profil
      const profileImageUrl = prompt("URL de l'image de profil (optionnelle):");
      
      try {
        const db = getFirestore();
        const docRef = await addDoc(collection(db, 'discussions'), {
          title,
          description: description || '',
          createdAt: serverTimestamp(),
          lastActivity: serverTimestamp(),
          createdBy: currentUser.uid,
          participants: [currentUser.uid],
          profileImageUrl: profileImageUrl || null  // Ajouter le profileImageUrl
        });
        
        // Sélectionner la nouvelle discussion
        selectDiscussion(docRef.id);
      } catch (error) {
        console.error("Erreur lors de la création de la discussion:", error);
        alert("Une erreur s'est produite lors de la création de la discussion");
      }
    };
    
    // Sélectionner une discussion
    const selectDiscussion = (discussionId) => {
      selectedDiscussionId.value = discussionId;
      emit('select-discussion', discussionId);
    };
    
    // Mettre à jour les statuts des utilisateurs dans les discussions
    const updateDiscussionStatuses = (data) => {
      if (data && data.discussionId && data.statuses) {
        discussionStatuses.value[data.discussionId] = data.statuses;
      }
    };
    
    // Vérifier si un utilisateur est en ligne
    const isUserOnline = (discussionId, userId) => {
      return discussionStatuses.value[discussionId] && 
             discussionStatuses.value[discussionId][userId] && 
             discussionStatuses.value[discussionId][userId].isOnline;
    };
    
    // Obtenir les n premiers participants
    const getTopParticipants = (discussionId, count) => {
      const discussion = discussions.value.find(d => d.id === discussionId);
      if (!discussion || !discussion.participants) return [];
      
      return discussion.participants.slice(0, count);
    };
    
    // Obtenir les initiales d'un nom
    const getInitials = (name) => {
      if (!name) return '?';
      
      const parts = name.split(' ').filter(Boolean);
      if (parts.length === 0) return '?';
      
      if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }
      
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };
    
    onMounted(() => {
      loadDiscussions();
    });
    
    return {
      discussions,
      loading,
      selectedDiscussionId,
      discussionStatuses,
      userNames,
      selectDiscussion,
      createNewDiscussion,
      formatDate,
      updateDiscussionStatuses,
      isUserOnline,
      getTopParticipants,
      getInitials
    };
  }
};
</script>

<style scoped>
.discussions-container {
  position: relative;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  min-height: 600px;
}

.discussions-title {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 24px;
  color: #2c3e50;
  border-bottom: 2px solid #e7e7e7;
  padding-bottom: 12px;
}

.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #25d366;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-discussions {
  text-align: center;
  padding: 40px;
  color: #666;
}

.create-discussion-btn {
  margin-top: 16px;
  padding: 10px 20px;
  background-color: #25d366;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.create-discussion-btn:hover {
  background-color: #128c7e;
  transform: translateY(-2px);
}

.discussions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.discussion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid transparent;
}

.discussion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.discussion-item.selected {
  border-left-color: #25d366;
  background-color: #f0f9f0;
}


.discussion-profile-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
  border: 2px solid #e0e0e0;
}

.discussion-profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discussion-content {
  flex: 1;
  min-width: 0;
}

.discussion-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.discussion-description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.discussion-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
}

.participants-preview {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.participant-indicator {
  margin-left: -10px;
  transition: transform 0.2s ease;
}

.participant-indicator:hover {
  transform: translateY(-4px);
}

.participant-indicator:first-child {
  margin-left: 0;
}

.participant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  border: 2px solid white;
  position: relative;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #9e9e9e;
  border: 2px solid white;
  position: absolute;
  bottom: -2px;
  right: -2px;
}

.status-dot.online {
  background-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  70% {
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.more-participants {
  margin-left: 8px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  background-color: #f0f0f0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.new-discussion-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #25d366;
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.new-discussion-btn:hover {
  transform: translateY(-4px) rotate(90deg);
  box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
  background-color: #128c7e;
}

.plus-icon {
  line-height: 1;
}
</style>