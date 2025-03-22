<template>
<div>
<h1>Liste d'offre d'emploi</h1>
<singlePost  v-for="post in posts" :key="post.id" :post="post">
</div>

</template>
<script>
import { ref, onMounted } from 'vue';
import SinglePost from './SinglePost.vue'; // Importer le composant enfant
import { getPosts } from '../composables/getPosts'; // Importer la fonction pour récupérer les posts
export default{
    nom:"PostList",
    components :{SinglePost},
    setup(){
        const posts = ref([]),
        const fetchPosts=async{
            try {
        posts.value = await getPosts(); // Récupérer les offres depuis l'API
      } catch (err) {
        console.error('Erreur lors du chargement des offres:', err);
      } 
        };
        onMounted(fetchPosts);
        return posts;

    }
}
</script>

