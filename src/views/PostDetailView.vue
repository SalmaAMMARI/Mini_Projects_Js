<template>
<div class="post-detail-container">
    <h2>{{poost.titre}}</h2>
    <p>{{poost.description}}</p>
   <p>salaire : {{poost.salaire}}</p>
</div>
</template>

<script>
import data from "@/db.json";

export default {
  name: "PostDetail",
 
  data() {
    return {
      poost: {}
    };
  },
  created() {
    this.poost = data.find(post => post.id === parseInt(this.$route.params.id)) || {};
  }
};
</script>

<style scoped>
.post-detail-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.post-detail-container h2 {
    color: #007BFF;
    margin-bottom: 20px;
    text-align: center;
}

.post-detail-container p {
    color: #555;
    line-height: 1.6;
    margin-bottom: 20px;
}

.post-detail-container .tag-cloud {
    margin-top: 20px;
}
</style>