<template>
  <div class="post-detail">
    <div v-if="loading">Chargement en cours...</div>
    <div v-else>
      <!-- Afficher les détails du post -->
      <h1>{{ post.title }}</h1>
      <p>{{ post.body }}</p>
      <p><strong>Salaire:</strong> {{ post.salaire }}</p>
      <p><strong>Date de création:</strong> {{ post['date de création'] }}</p>

      <!-- Afficher les tags associés au post -->
      <TagCloud :tags="post.tags || []" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getPost } from '../composables/getPost'; // Importer la fonction pour récupérer un post
import TagCloud from '../components/TagCloud.vue'; // Importer le composant TagCloud

export default {
  name: 'PostDetailView',
  components: { TagCloud }, // Enregistrer le composant TagCloud
  setup() {
    const route = useRoute();
    const post = ref(null); // Stocker les détails du post
    const loading = ref(true); // État de chargement

    // Fonction pour charger les détails du post
    const fetchPost = async () => {
      try {
        const postId = route.params.id; // Récupérer l'ID du post depuis l'URL
        post.value = await getPost(postId); // Récupérer le post par son ID
      } catch (err) {
        console.error('Erreur lors du chargement du post:', err);
      } finally {
        loading.value = false; // Désactiver l'état de chargement
      }
    };

    // Charger les détails du post au montage du composant
    onMounted(fetchPost);

    return { post, loading };
  }
};
</script>

<style scoped>
.post-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

p {
  margin-bottom: 10px;
}
</style>