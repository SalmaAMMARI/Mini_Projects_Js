<template>
<div class="Tags"  >
<div v-for="tag in tagsview" :key="tag">
<button  @click="goToTag(tag)">{{tag}}</button>
</div>

</div>
</template>
<script>
export default{
    name:"TagCloud",
    props:{
        tagsview:Array
    },
    methods:{
        goToTag(tag){
            this.$router.push('/tags/'+ tag)
        }
    }
}
</script>