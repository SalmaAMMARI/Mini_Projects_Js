<!-- components/AddBook.vue -->
<template>
  <div>
    <h2>Add a New Book</h2>
    <form @submit.prevent="addBook">
      <input v-model="title" placeholder="Title" required />
      <input v-model="author" placeholder="Author" required />
      <input v-model="year" placeholder="Year" type="number" required />
      <input v-model="category" placeholder="Category" required />
      <select v-model="status" required>
        <option value="available">Available</option>
        <option value="borrowed">Borrowed</option>
      </select>
      <input v-model="summary" placeholder="Summary" required />
      <input v-model="image" placeholder="Image URL" required />
      <button type="submit">Add Book</button>
    </form>
  </div>
</template>

<script>
import booksData from '@/assets/db.json';

export default {
  data() {
    return {
      title: '',
      author: '',
      year: '',
      category: '',
      status: 'available',
      summary: '',
      image: ''
    };
  },
  methods: {
    addBook() {
      const newBook = {
        id: booksData.books.length + 1,
        title: this.title,
        author: this.author,
        year: this.year,
        category: this.category,
        status: this.status,
        summary: this.summary,
        image: this.image
      };
      booksData.books.push(newBook);
      this.$router.push({ name: 'Books' });
    }
  }
};
</script>