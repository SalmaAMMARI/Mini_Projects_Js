
<template>
  <div class="book-list">
    <div class="filters">
      <input v-model="searchQuery" placeholder="Search by title or author" />
      <select v-model="statusFilter">
        <option value="">All Status</option>
        <option value="available">Available</option>
        <option value="borrowed">Borrowed</option>
      </select>
      <router-link to="/add-book" class="add-book-btn">Add New Book</router-link>
    </div>
    
    <div v-if="filteredBooks.length" class="books-container">
      <div v-for="book in filteredBooks" :key="book.id" class="book-card">
        <img :src="book.image" alt="Book cover" class="book-thumbnail" />
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p><strong>Author:</strong> {{ book.author }}</p>
          <p><strong>Year:</strong> {{ book.year }}</p>
          <p><strong>Category:</strong> {{ book.category }}</p>
          <p><strong>Status:</strong> {{ book.status }}</p>
          <button @click="viewDetails(book.id)" class="view-btn">View Details</button>
        </div>
      </div>
    </div>
    <div v-else class="no-results">
      <p>No books found matching your criteria.</p>
    </div>
  </div>
</template>

<script>
import booksData from '@/assets/db.json';

export default {
  data() {
    return {
      searchQuery: '',
      statusFilter: '',
      books: booksData.books
    };
  },
  computed: {
    filteredBooks() {
      const query = this.searchQuery.toLowerCase();
      return this.books.filter(book => {
        const matchesQuery = 
          book.title.toLowerCase().includes(query) || 
          book.author.toLowerCase().includes(query);
        const matchesStatus = this.statusFilter ? 
          book.status === this.statusFilter : true;
        return matchesQuery && matchesStatus;
      });
    }
  },
  methods: {
    viewDetails(bookId) {
      this.$router.push({ name: 'BookDetail', params: { id: bookId } });
    }
  }
};
</script>

<style scoped>
.book-list {
  padding: 20px;
}

.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

input, select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-book-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-left: auto;
}

.books-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.book-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.book-thumbnail {
  width: 100%;
  height: 200px;
  object-fit: contain;
  margin-bottom: 15px;
}

.book-info {
  flex-grow: 1;
}

.view-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.no-results {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}
</style>