<!-- views/Books.vue -->
<template>
  <div class="books-page">
    <BookList />
  </div>
</template>

<script>
import BookList from '@/components/BookList.vue';

export default {
  name: 'Books',
  components: {
    BookList
  }
};
</script>

<style scoped>
.books-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>