<template>
  <div id="app">
    <!-- Barre de navigation -->
    <NavBar />

    <!-- Contenu principal -->
    <main role="main">
      <router-view />
    </main>

    <!-- Pied de page (optionnel) -->
    <footer>
      <p>&copy; 2023 Mon Application Vue.js</p>
    </footer>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
  name: 'App',
  components: {
    NavBar
  }
};
</script>

<style>
/* Styles globaux */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

/* Styles pour le contenu principal */
main {
  padding: 20px;
}

/* Styles pour le pied de page */
footer {
  text-align: center;
  padding: 10px;
  background-color: #f8f9fa;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
}
</style>