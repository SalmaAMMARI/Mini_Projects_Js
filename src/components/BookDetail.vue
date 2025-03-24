<!-- components/BookDetail.vue -->
<template>
  <div v-if="book" class="book-detail">
    <img :src="book.image" alt="Book cover" class="book-cover" />
    <h1>{{ book.title }}</h1>
    <p><strong>Author:</strong> {{ book.author }}</p>
    <p><strong>Year:</strong> {{ book.year }}</p>
    <p><strong>Category:</strong> {{ book.category }}</p>
    <p><strong>Status:</strong> {{ book.status }}</p>
    <p><strong>Summary:</strong> {{ book.summary }}</p>
    <router-link to="/books" class="back-link">Back to Books</router-link>
  </div>
  <div v-else>
    <p>Book not found</p>
  </div>
</template>

<script>
import booksData from '@/assets/db.json';

export default {
  data() {
    return {
      book: null
    };
  },
  created() {
    const bookId = parseInt(this.$route.params.id);
    this.book = booksData.books.find(book => book.id === bookId);
  }
};
</script>

<style scoped>
.book-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.book-cover {
  max-width: 200px;
  height: auto;
  margin-bottom: 20px;
}
.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #42b983;
}
</style>