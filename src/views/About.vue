<template>
  <div class="about">
    <h1>About Us</h1>
    <p>This is a university library management system designed to help students and faculty manage book resources.</p>
    <p>Features include:</p>
    <ul>
      <li>Browse the book collection</li>
      <li>View detailed book information</li>
      <li>Add new books to the library</li>
      <li>Filter books by availability</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'About'
};
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.about ul {
  text-align: left;
  margin: 20px auto;
  max-width: 600px;
}
</style>