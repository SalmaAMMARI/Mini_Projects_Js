<template>
  <div id="app">
    <nav class="navbar">
      <router-link to="/" exact>Home</router-link> |
      <router-link to="/books">Books</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/add-book">Add Book</router-link>
    </nav>
    
    <div class="container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0 auto;
  max-width: 1200px;
  padding: 20px;
}

.navbar {
  padding: 20px 0;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.navbar a {
  font-weight: bold;
  color: #2c3e50;
  margin: 0 10px;
  text-decoration: none;
}

.navbar a.router-link-exact-active {
  color: #42b983;
}

.container {
  min-height: 400px;
}
</style>