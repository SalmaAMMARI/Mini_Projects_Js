<template>
<div class="Post">
<h2> {{post.title}}</h2>
<p>{{post.description}}</p>
<p>salaire: {{post.salaire}}</p>
<p>Date de création {{post['date de création']}}</p>
<router-link :to="`/post/${post.id}`">Voir les détails</router-link>
</div>

</template>
<script>
export default{
    name:'Single Post';
    props:{
        type:object;
        required:true
    }

};
</script>
