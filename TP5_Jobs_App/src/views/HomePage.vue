<template>
  <div class="home-container">
    <PostList :posts="json_posts" @delete-post="deletePost"></PostList>
  </div>
</template>

<script>
import PostList from "@/components/PostList.vue";
import Data from "@/db.json";

export default {
  name: "HomePage",
  components: {
    PostList
  },
  data() {
    return {
      json_posts: []
    };
  },
  mounted() {
    this.json_posts = Data; // Charge les données depuis db.json
  },
  methods: {
    deletePost(postId) {
      // Supprime le post de la liste
      this.json_posts = this.json_posts.filter(post => post.id !== postId);

      // Met à jour le fichier db.json (optionnel, nécessite une API ou un système de persistance)
      this.updateDbJson();
    },
    updateDbJson() {
      // Si tu utilises une API, envoie une requête pour mettre à jour db.json
      // Exemple avec fetch :
      fetch('/api/updateDb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.json_posts)
      })
        .then(response => response.json())
        .then(data => {
          console.log("db.json mis à jour :", data);
        })
        .catch(error => {
          console.error("Erreur lors de la mise à jour de db.json :", error);
        });
    }
  }
};
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.home-container h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}
</style>