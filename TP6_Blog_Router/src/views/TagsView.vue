<template>
  <div class="tags-view-container">
    <div v-if="poosts.length > 0">
      <div v-for="post in poosts" :key="post.id" class="post-item">
        <h2>{{ post.titre }}</h2>
        <p>{{ post.article }}</p>
        <TagCloud :tagsview="post.tags" />
      </div>
    </div>
    <div v-else class="no-posts">
      <p>Aucun post trouvé pour ce tag.</p>
    </div>
  </div>
</template>

<script>
import data from "@/db.json"
import TagCloud from "@/components/TagCloud.vue"

export default {
  name: "TagsView",
  components: {
    TagCloud
  },
  data() {
    return {
      poosts: [],
      koko: 0
    }
  },
  created() {
    this.filterPostsByTag(this.$route.params.tag);
  },
  watch: {
    '$route.params.tag': function(newTag) {
      this.filterPostsByTag(newTag);
    }
  },
  methods: {
    filterPostsByTag(tag) {
      const selectedTag = tag.toLowerCase(); // Normalize the tag
      console.log("Selected tag:", selectedTag); // Debug

      this.poosts = []; // Clear the current posts

      for (let post of data) {
        const normalizedTags = post.tags.map(tag => tag.toLowerCase()); // Normalize tags
        console.log("Post tags:", normalizedTags); // Debug

        if (normalizedTags.includes(selectedTag)) {
          this.poosts.push(post);
          console.log("Matching post found:", post); // Debug
        }
      }
    }
  }
}
</script>

<style scoped>
.tags-view-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.post-item {
    background-color: #fff;
    padding: 15px;
    margin: 10px 0;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-item h2 {
    margin: 0;
    color: #007BFF;
}

.post-item p {
    color: #555;
    line-height: 1.6;
}

.no-posts {
    text-align: center;
    color: #555;
    margin-top: 20px;
}
</style>