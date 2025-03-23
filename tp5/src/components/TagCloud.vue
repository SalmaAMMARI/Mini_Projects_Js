<template>
<div class="tags">
    <div v-for="tag in tagsview" :key="tag">
        <button @click="goToTag(tag)" class="tag-button">{{tag}}</button>
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
            this.$router.push('/TagsView/'+ tag)
        }
    }
}
</script>

<style scoped>
.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}

.tag-button {
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    background-color: #007BFF;
    color: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

.tag-button:hover {
    background-color: #0056b3;
}
</style>