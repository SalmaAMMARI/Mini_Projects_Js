<template>
  <div class="form-container">
    <input type="text" id="nom" placeholder="title" v-model="newPost.titre" class="input-field"><br>
    <textarea placeholder="article" v-model="newPost.description" class="textarea-field"></textarea><br>
    <input type="text" placeholder="entrer un salaire" v-model="newPost.salaire" class="input-field"><br>
    <input type="text" placeholder="entre une date de création" v-model="newPost.creation" class="input-field"><br>
    <button type="submit" @click="updatePost" class="button">Enregistrer</button><br>
  </div>
</template>

<script>
import Data from "@/db.json";

export default {
  name: "EditJob",
  data() {
    return {
      newPost: {
        titre: '',
        description: '',
        salaire: '$',
        creation: '',
        id: 0,
        tags: []
      },
      json_post: []
    };
  },
  mounted() {
    this.json_post = Data;
    const postId = parseInt(this.$route.params.id);
    const post = this.json_post.find(post => post.id === postId);
    if (post) {
      this.newPost = { ...post };
    }
  },
  methods: {
    updatePost() {
      const index = this.json_post.findIndex(post => post.id === this.newPost.id);
      if (index !== -1) {
        this.json_post.splice(index, 1, this.newPost);
        this.$router.push("/");
      }
    }
  }
};
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.input-field, .textarea-field {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.textarea-field {
  height: 100px;
}

.button {
  padding: 10px 20px;
  margin: 10px 0;
  border: none;
  border-radius: 5px;
  background-color: #007BFF;
  color: white;
  cursor: pointer;
}

.button:hover {
  background-color: #0056b3;
}
</style>