<template>
<input type="name" id="nom" placeholder="title" v-model="newPost.titre">
<textarea ></textarea>


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
        this.json_post=Data,
    }
}

</script>