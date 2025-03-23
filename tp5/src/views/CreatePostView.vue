<template>
<div class="form-container">
    <input type="name" id="nom" placeholder="title" v-model="newPost.titre" class="input-field"><br>
    <textarea placeholder="article" v-model="newPost.article" class="textarea-field"></textarea><br>
    <button @click="showTagInput" class="button">Ajouter Tag</button><br>
    <div v-if="add" class="tag-input-container">
        <input type="text" v-model="newTag" placeholder="Enter tag" class="input-field">
        <button @click="addTag" class="button">ajouter</button><br>
    </div>
    <button type="submit" @click="create" class="button">Create</button><br>
    <div class="tags-container">
        <h3>Tags:</h3>
        <ul class="tags-list">
            <li v-for="tag in newPost.tags" :key="tag" class="tag-item">{{ tag }}</li>
        </ul>
    </div>
</div>
</template>

<script>
import Data from "@/db.json"
export default{
    name:"createPost",
    data(){
        return{
            newPost:{
                titre:'',
                article:'',
                id:0,
                tags: [] // Ajout de la propriété tags
            },
            json_post:[],
            add:false,
            newTag: '' // Ajout de la propriété newTag
        }
    },
    mounted(){
        this.json_post=Data
    },
    methods:{
        showTagInput() {
            this.add = true;
        },
        addTag() {
            if (this.newTag) {
                this.newPost.tags.push(this.newTag);
                this.newTag = '';
                this.add = false;
            }
        },
        create(){
            this.newPost.id = (this.json_post.length) ? this.json_post[this.json_post.length-1].id +1 : 0;
            this.json_post.push(this.newPost);
            this.$router.push("/");
        }
    }
}
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

.tag-input-container {
    margin: 10px 0;
}

.tags-container {
    margin-top: 20px;
}

.tags-list {
    list-style-type: none;
    padding: 0;
}

.tag-item {
    display: inline-block;
    background-color: #e0e0e0;
    padding: 5px 10px;
    margin: 5px;
    border-radius: 5px;
}
</style>