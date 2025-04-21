<template>
  <div class="discussion-list">
    <h2>Discussions</h2>

    <!-- Subnavbar for filtering -->
    <div class="sub-navbar">
      <div class="search-bar-container">
        <i class="fa fa-search search-icon"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by title..." 
          class="search-bar"
        />
      </div>
  

      <div class="filter-container">
        <select v-model="selectedCategory">
          <option value="">All Categories</option>
          <option v-for="category in allCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>

        <select v-model="selectedYear">
          <option value="">All Years</option>
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>

        <select v-model="selectedMonth">
          <option value="">All Months</option>
          <option v-for="(monthName, index) in months" :key="index" :value="(index + 1).toString().padStart(2, '0')">
            {{ monthName }}
          </option>
        </select>

        <select v-model="selectedDay">
          <option value="">All Days</option>
          <option v-for="day in 31" :key="day" :value="String(day).padStart(2, '0')">{{ day }}</option>
        </select>

        <select v-model="selectedHour">
          <option value="">All Hours</option>
          <option v-for="hour in 24" :key="hour" :value="String(hour).padStart(2, '0')">{{ hour }}</option>
        </select>
      </div>

      <button @click="$router.push('/create')" class="create-btn">
        <i class="fa fa-plus"></i> Create Discussion
      </button>
    </div>

    <div v-for="discussion in filteredDiscussions" :key="discussion.id">
      <router-link :to="`/discussion/${discussion.id}`" class="discussion-preview">
        <h3>{{ discussion.title }}</h3>
        <p>{{ discussion.content.slice(0, 100) }}...</p>
        <div class="meta">
          <span><i class="fa fa-user"></i> Created by: {{ discussion.authorName }}</span>
          <span><i class="fa fa-folder"></i> Category: {{ discussion.category }}</span>
          <span><i class="fa fa-calendar"></i> Created at: {{ new Date(discussion.createdAt?.seconds * 1000).toLocaleString() }}</span>
          <span><i class="fa fa-comment"></i> {{ discussion.repliesCount }} Replies</span>
       
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: "AIzaSyD6Ls27tC0PCig7KSVBBrAwYdJYukNPRQk",
  authDomain: "projectspd-c4560.firebaseapp.com",
  projectId: "projectspd-c4560",
  storageBucket: "projectspd-c4560.appspot.com",
  messagingSenderId: "161091067585",
  appId: "1:161091067585:web:7f9b054cc176805801fe40"
}

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp)

const discussions = ref([])
const responses = ref([])

const selectedCategory = ref('')
const searchQuery = ref('')
const selectedYear = ref('')
const selectedMonth = ref('')
const selectedDay = ref('')
const selectedHour = ref('')
const allCategories = ref(['Gaming', 'Cooking', 'Tech', 'Music', 'Travel','General', 'Coding'])

const fetchDiscussions = async () => {
  const snapshot = await getDocs(collection(db, 'discussions'))
  discussions.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    repliesCount: 0
  }))
}

const fetchResponses = async () => {
  const snapshot = await getDocs(collection(db, 'responses'))
  responses.value = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  const countMap = {}
  responses.value.forEach(res => {
    if (res.discussionId) {
      countMap[res.discussionId] = (countMap[res.discussionId] || 0) + 1
    }
  })

  discussions.value = discussions.value.map(disc => ({
    ...disc,
    repliesCount: countMap[disc.id] || 0
  }))
}


const filteredDiscussions = computed(() => {
  let filtered = discussions.value

  if (selectedCategory.value) {
    filtered = filtered.filter(d => d.category === selectedCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(d => d.title.toLowerCase().includes(query))
  }

  filtered = filtered.filter(d => {
    const date = new Date(d.createdAt.seconds * 1000)
    const year = date.getFullYear().toString()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hour = date.getHours().toString().padStart(2, '0')

    return (!selectedYear.value || selectedYear.value === year) &&
           (!selectedMonth.value || selectedMonth.value === month) &&
           (!selectedDay.value || selectedDay.value === day) &&
           (!selectedHour.value || selectedHour.value === hour)
  })

  return filtered.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
})

const years = [2025, 2024, 2023].map(String)
const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => m.toString().padStart(2, '0'))

onMounted(async () => {
  await fetchDiscussions()
  await fetchResponses()
})
</script>
<style scoped>
.discussion-list {
  padding: 3rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 2.5rem;
  color: #2c3e50;
  text-align: center;
  position: relative;
  padding-bottom: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, #3498db, #2c3e50);
  border-radius: 3px;
}

.sub-navbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 3.5rem;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
  padding: 1.8rem;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.search-bar-container {
  position: relative;
  flex-grow: 1;
  max-width: 350px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #95a5a6;
}

.search-bar {
  width: 100%;
  padding: 0.9rem 1rem 0.9rem 2.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.search-bar:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.filter-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

select {
  padding: 0.8rem 1.2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.9rem;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #2c3e50;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
  background-image: linear-gradient(to bottom, #ffffff, #f8f9fa);
}

select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.create-btn {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  border: none;
  padding: 0.9rem 1.5rem;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  letter-spacing: 0.3px;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #2980b9, #1e2a36);
}

.discussion-preview {
  display: block;
  background-color: #fff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  border-left: 5px solid #3498db;
  position: relative;
}

.discussion-preview:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #2c3e50;
}

.discussion-preview h3 {
  font-size: 1.6rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 600;
  line-height: 1.3;
}

.discussion-preview p {
  color: #7f8c8d;
  margin-bottom: 1.3rem;
  line-height: 1.6;
  font-size: 1.05rem;
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #95a5a6;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f1f1;
}

.meta i {
  margin-right: 0.5rem;
  color: #3498db;
}

.meta span {
  background-color: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.2s;
}

.meta span:hover {
  background-color: #eef2f5;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .sub-navbar {
    flex-direction: column;
    gap: 1.3rem;
    padding: 1.5rem;
  }
  
  .search-bar-container {
    max-width: 100%;
    width: 100%;
  }
  
  .filter-container {
    width: 100%;
    justify-content: space-between;
    gap: 0.8rem;
  }
  
  select {
    flex: 1;
    min-width: 120px;
  }
  
  .create-btn {
    width: 100%;
    justify-content: center;
  }
  
  .meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .meta span {
    display: block;
    width: 100%;
  }
  
  .discussion-preview {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .discussion-list {
    padding: 2rem 1rem;
  }
  
  h2 {
    font-size: 2rem;
  }
  
  .discussion-preview h3 {
    font-size: 1.4rem;
  }
}
</style>