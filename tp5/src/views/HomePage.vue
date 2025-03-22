<template>
<div class="home">
<h1>Liste des Articles</h1>
  <!-- Afficher la liste des articles -->
    <PostList :posts="posts" />

    <!-- Afficher la liste des tags -->
    <TagCloud :tags="tags" />
</div>


</template>
<script>
import { ref, onMounted } from 'vue';
import { getPosts } from '../composables/getPosts'; // Importer la fonction pour récupérer les posts
import PostList from '../components/PostList.vue'; // Importer le composant PostList
import TagCloud from '../components/TagCloud.vue'; // Importer le composant TagCloud

export default {
  name: 'Home',
  components: { PostList, TagCloud }, // Enregistrer les composants
  setup() {
    const posts = ref([]); // Liste des posts
    const tags = ref([]); // Liste des tags uniques
    const loading = ref(true); // État de chargement

    // Fonction pour charger les posts et extraire les tags
    const fetchPosts = async () => {
      try {
        posts.value = await getPosts(); // Récupérer les posts depuis l'API
        tags.value = extractUniqueTags(posts.value); // Extraire les tags uniques
      } catch (err) {
        console.error('Erreur lors du chargement des posts:', err);
      } finally {
        loading.value = false; // Désactiver l'état de chargement
      }
    };

    // Fonction pour extraire les tags uniques des posts
    const extractUniqueTags = (posts) => {
      const allTags = posts.flatMap(post => post.tags || []); // Rassembler tous les tags
      return [...new Set(allTags)]; // Retourner les tags uniques
    };

    // Charger les posts au montage du composant
    onMounted(fetchPosts);

    return { posts, tags, loading };
  }
};
</script>
