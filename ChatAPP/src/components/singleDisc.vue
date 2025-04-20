<template>
  <div 
    class="discussion-item" 
    :class="{ 'active': isActive }"
    @click="viewDiscussion"
  >
    <!-- For private discussions, show other participant's profile picture -->
    <div v-if="discussion.isPrivate" class="user-profile">
      <img 
        v-if="otherParticipant && otherParticipant.profileImageUrl" 
        :src="otherParticipant.profileImageUrl" 
        :alt="`${otherParticipant.firstName} ${otherParticipant.lastName}`"
        class="profile-pic"
      />
      <div v-else class="fallback-avatar">
        {{ otherParticipant ? getInitials(otherParticipant.firstName, otherParticipant.lastName) : '?' }}
      </div>
      <span v-if="otherParticipant?.isOnline" class="online-status"></span>
    </div>
    
    <!-- For public discussions, show creator pic if available, otherwise show discussion icon -->
    <div v-else class="discussion-icon">
      <img 
        v-if="discussion.creatorPic" 
        :src="discussion.creatorPic" 
        alt="Creator" 
        class="profile-pic"
      />
      <img 
        v-else-if="discussion.imageUrl" 
        :src="discussion.imageUrl" 
        alt="Discussion" 
        class="discussion-img"
      />
      <div v-else class="default-icon">👥</div>
    </div>
    
    <div class="discussion-content">
      <div class="discussion-header">
        <h3 class="discussion-title">
          {{ discussion.title }}
          <span v-if="discussion.isPrivate && otherParticipant" class="participant-name">
            ({{ otherParticipant.firstName }} {{ otherParticipant.lastName }})
          </span>
        </h3>
        <span class="discussion-type" :class="{ 'private': discussion.isPrivate }">
          {{ discussion.isPrivate ? 'Privé' : 'Public' }}
        </span>
      </div>
      
      <p class="discussion-description">{{ discussion.description }}</p>
      
      <div class="discussion-meta">
        <span class="message-count" v-if="discussion.messageCount !== undefined">
          {{ discussion.messageCount }} message{{ discussion.messageCount !== 1 ? 's' : '' }}
        </span>
        <span class="last-activity" v-if="discussion.lastActivity">
          {{ formatDate(discussion.lastActivity) }}
        </span>
      </div>
      
      <div class="discussion-actions">
        <button v-if="!isParticipant" @click.stop="joinDiscussion" class="join-btn">
          Rejoindre
        </button>
        <button v-else @click.stop="leaveDiscussion" class="leave-btn">
          Quitter
        </button>
        <button @click.stop="viewDiscussion" class="view-btn">
          Voir
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  props: {
    discussionId: {
      type: String,
      required: true
    },
    isParticipant: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['view-discussion', 'join-discussion', 'leave-discussion'],
  
  setup(props, { emit }) {
    const discussion = ref({});
    const loading = ref(true);
    const otherParticipant = ref(null);
    const currentUserId = ref(null);
    
    // Fetch current user ID
    onMounted(() => {
      const auth = getAuth();
      if (auth.currentUser) {
        currentUserId.value = auth.currentUser.uid;
      }
      
      fetchDiscussion();
    });
    
    // Watch for changes in discussionId
    watch(() => props.discussionId, () => {
      fetchDiscussion();
    });
    
    // Fetch discussion details
    const fetchDiscussion = async () => {
      try {
        const db = getFirestore();
        const discussionDoc = await getDoc(doc(db, 'discussions', props.discussionId));
        
        if (discussionDoc.exists()) {
          discussion.value = {
            id: discussionDoc.id,
            ...discussionDoc.data()
          };
          
          // If it's a private discussion, fetch the other participant's info
          if (discussion.value.isPrivate && discussion.value.participants) {
            await fetchOtherParticipant();
          }
        }
        
        loading.value = false;
      } catch (error) {
        console.error("Error fetching discussion:", error);
        loading.value = false;
      }
    };
    
    // For private discussions, fetch the other participant's info
    const fetchOtherParticipant = async () => {
      if (!discussion.value.participants || !currentUserId.value) return;
      
      // Find the participant that is not the current user
      const otherUserId = discussion.value.participants.find(id => id !== currentUserId.value);
      
      if (otherUserId) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            otherParticipant.value = {
              id: otherUserId,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              profileImageUrl: userData.profileImageUrl || null,
              isOnline: userData.isOnline || false
            };
          }
        } catch (error) {
          console.error("Error fetching other participant:", error);
        }
      }
    };
    
    const getInitials = (firstName, lastName) => {
      let initials = '';
      if (firstName) initials += firstName.charAt(0).toUpperCase();
      if (lastName) initials += lastName.charAt(0).toUpperCase();
      return initials || '?';
    };
    
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };
    
    const viewDiscussion = () => {
      emit('view-discussion', props.discussionId);
    };
    
    const joinDiscussion = () => {
      emit('join-discussion', props.discussionId);
    };
    
    const leaveDiscussion = () => {
      emit('leave-discussion', props.discussionId, discussion.value.isPrivate);
    };
    
    return {
      discussion,
      loading,
      otherParticipant,
      getInitials,
      formatDate,
      viewDiscussion,
      joinDiscussion,
      leaveDiscussion
    };
  }
}
</script>

<style scoped>
.discussion-item {
  display: flex;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #eaeaea;
}

.discussion-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.discussion-item.active {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.user-profile, .discussion-icon {
  width: 50px;
  height: 50px;
  margin-right: 15px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background-color: #f5f5f5;
}

.profile-pic, .discussion-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fallback-avatar, .default-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
}

.fallback-avatar {
  color: white;
  background-color: #1976d2;
}

.default-icon {
  font-size: 24px;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #4caf50;
  border: 2px solid white;
}

.discussion-content {
  flex: 1;
  min-width: 0;
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.discussion-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.participant-name {
  font-weight: normal;
  font-size: 0.9em;
  color: #666;
}

.discussion-type {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 12px;
  background-color: #e3f2fd;
  color: #1976d2;
}

.discussion-type.private {
  background-color: #ffebee;
  color: #d32f2f;
}

.discussion-description {
  margin: 5px 0;
  color: #666;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.discussion-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #999;
  margin: 5px 0;
}

.discussion-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.join-btn, .leave-btn, .view-btn {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.join-btn {
  background-color: #1976d2;
  color: white;
}

.join-btn:hover {
  background-color: #1565c0;
}

.leave-btn {
  background-color: #f5f5f5;
  color: #666;
}

.leave-btn:hover {
  background-color: #e0e0e0;
}

.view-btn {
  background-color: #f5f5f5;
  color: #333;
}

.view-btn:hover {
  background-color: #e0e0e0;
}
</style>