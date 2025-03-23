<template>
  <div class="post">
    <h2>{{ post.titre }}</h2>
    <p>{{ post.description.substring(0, 50) }}</p>
    <button @click="goToDetails" class="details-button">Go to Details</button>
    <button @click="confirmDelete(post.id)" class="delete-button">Supprimer l'emploi</button>
    <button class="details-button" @click="Edit">Modifier le post</button>
  </div>
</template>

<script>
export default {
  name: "SinglePost",
  props: {
    post: {
      type: Object,
      required: false,
      default: () => ({})
    }
  },
  methods: {
    goToDetails() {
      this.$router.push("/post/" + this.post.id);
    },
    confirmDelete(postId) {
      if (confirm("Êtes-vous sûr de vouloir supprimer cet emploi ?")) {
        this.deletePost(postId);
      }
    },
    deletePost(postId) {
      this.$emit('delete-post', postId);
    },
    Edit() {
      this.$router.push("/edit/" + this.post.id);
    }
  }
};
</script>

<style scoped>
.post {
  background-color: #fff;
  padding: 20px;
  margin: 10px 0;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.post h2 {
  color: #007BFF;
  margin-bottom: 10px;
}

.post p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
}

.details-button, .delete-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  margin-right: 10px;
}

.details-button {
  background-color: #007BFF;
}

.details-button:hover {
  background-color: #0056b3;
}

.delete-button {
  background-color: #dc3545; /* Rouge */
}

.delete-button:hover {
  background-color: #c82333; /* Rouge foncé */
}
</style>