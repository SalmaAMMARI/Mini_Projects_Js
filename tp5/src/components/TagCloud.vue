<template>
<div class="Tags"  >
<div v-for="tag in tags" :key="tag">
<button  @click="goToTag(tag)">{{tag}}</button>
</div>

</div>
</template>
<script>
export default{
    nom:"TagCloud",
    props:{
        tags:Array
    },
    methods:{
        goToTag(tag){
            this.$router.push('/tags/'+ tag)
        }
    }
}
</script>