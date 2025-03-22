<template>
<div class="create-post">
<h1>Créer un poste</h1>
   <form @submit.prevent="submitPost">
      <!-- Champ pour le titre -->
      <div class="form-group">
        <label for="title">Titre</label>
        <input
          type="text"
          id="title"
          v-model="title"
          placeholder="Entrez le titre"
          required
        />
      </div>

      <div class="form-group">
        <label for="body">Contenu</label>
        <textarea
          id="body"
          v-model="body"
          placeholder="Entrez le contenu"
          required
        ></textarea>
      </div>
      <div class="form-group">
        <label for="tags">Tags</label>
        <input
          type="text"
          id="tags"
          v-model="tags"
          placeholder="Entrez les tags (séparés par des virgules)"
          required
        />
      </div>

      <!-- Bouton de soumission -->
      <button type="submit">Créer le post</button>
      </form>
</div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { addPost } from '../composables/addPost'; // Importer la fonction pour ajouter un post

export default {
  name: 'CreatePostView',
  setup() {
    const title = ref(''); // Titre du post
    const body = ref(''); // Contenu du post
    const tags = ref(''); // Tags du post
    const error = ref(''); // Message d'erreur
    const success = ref(''); // Message de succès
    const router = useRouter(); // Utiliser le routeur pour la redirection

    // Fonction pour soumettre le formulaire
    const submitPost = async () => {
      error.value = ''; // Réinitialiser le message d'erreur
      success.value = ''; // Réinitialiser le message de succès

      // Valider les champs
      if (!title.value || !body.value || !tags.value) {
        error.value = 'Veuillez remplir tous les champs.';
        return;
      }

      try {
        // Préparer les données du post
        const post = {
          title: title.value,
          body: body.value,
          tags: tags.value.split(',').map(tag => tag.trim()), // Convertir les tags en tableau
        };

        // Ajouter le post via l'API
        await addPost(post);

        // Afficher un message de succès
        success.value = 'Post créé avec succès !';

        // Réinitialiser le formulaire
        title.value = '';
        body.value = '';
        tags.value = '';

        // Rediriger vers la page d'accueil après 2 secondes
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (err) {
        console.error('Erreur lors de la création du post:', err);
        error.value = 'Une erreur est survenue lors de la création du post.';
      }
    };

    return { title, body, tags, error, success, submitPost };
  }
};
</script>
