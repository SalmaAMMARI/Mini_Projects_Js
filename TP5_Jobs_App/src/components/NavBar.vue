<template>
  <nav class="navbar">
    <router-link to="/" class="nav-link">Home</router-link>
    <router-link to="/add" class="nav-link">Create Job</router-link>
  </nav>
</template>

<script>
export default {
    name: 'NavBar'
};
</script>

<style scoped>
.navbar {
    display: flex;
    justify-content: center;
    background-color: #007BFF;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.nav-link {
    color: white;
    text-decoration: none;
    margin: 0 15px;
    font-size: 18px;
    font-weight: bold;
}

.nav-link:hover {
    text-decoration: underline;
}
</style>