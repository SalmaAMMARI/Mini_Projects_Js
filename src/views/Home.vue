<template>
  <div class="home">
    <h1>Welcome to the University Library Management System</h1>
    <p>Browse our collection of books or add new ones to the library.</p>
    <router-link to="/books" class="browse-btn">Browse Books</router-link>
  </div>
</template>

<script>
export default {
  name: 'Home'
};
</script>

<style scoped>
.home {
  text-align: center;
  padding: 40px 20px;
}

.browse-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>