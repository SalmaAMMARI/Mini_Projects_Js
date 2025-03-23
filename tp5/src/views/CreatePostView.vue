<template>
<div>
<input type="name" id="nom" placeholder="title" v-model="newPost.titre"><br>
<textarea placeholder="article" v-model="newPost.article"></textarea><br>
<button type="submit" @click="create">Create</button><br>
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

            },
            json_post:[]

        }
    },
    mounted(){
        this.json_post=Data
    },
    methods:{
        create(){
            this.json_post.push(this.newPost);
            this.$router.push("/");
            this.newPost.id= (this.json_post.length )?this.json_post[this.json_post.length-1].id +1 :0;
        }
    }
}

</script>