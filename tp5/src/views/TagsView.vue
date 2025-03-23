<template>
  <div>
    <div v-if="poosts.length > 0">
      <div v-for="post in poosts" :key="post.id">
        <h2>{{ post.titre }}</h2>
        <p>{{ post.article }}</p>
        <TagCloud :tagsview="post.tags" />
      </div>
    </div>
    <div v-else>
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
    const selectedTag = this.$route.params.tag.toLowerCase(); // Normalize the tag
    console.log("Selected tag:", selectedTag); // Debug

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
</script>