<template>
<div>
<h2>{{poost.titre}}</h2>
<p>{{poost.article}}</p>
<TagCloud :tags="poost.tags" > </TagCloud>



</div>
</template>

<script>
import data from "@/db.json"
import TagCloud from "@/components/TagCloud.vue"
export default{
    name:"PostDetail",
    components:{
        TagCloud

    },
    data(){
        return{
            poost:{},
            test : 15
        }
    },
    created(){
        for(let post of data){
            if (post.id===parseInt(this.$route.params.id)){
                this.poost=post;
                this.test=10;
                break;

            }
        }
    }

}
</script>