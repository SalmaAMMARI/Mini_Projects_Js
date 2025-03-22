<template>
  <div id="app">
    <!-- Barre de navigation -->
    <NavBar />

    <!-- Contenu dynamique -->
    <router-view />
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'; // Importer le composant NavBar

export default {
  name: 'App',
  components: { NavBar } // Enregistrer le composant NavBar
};
</script>

<style>
/* Styles globaux */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>