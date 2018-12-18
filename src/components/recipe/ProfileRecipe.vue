<template>
  <div class="profile-recipe container">
    <div class="row">
      <div class="left back-link">
        <router-link :to="{name:'ViewProfile', params: { id: recipe.author }}">Back</router-link>
      </div>
      <div class="col s12 jumbotron" v-bind:style="{ backgroundImage: 'url(' + recipe.img_url + ')' }">
        <div class="jumbotron-darken">
          <h5 class="white-text center">{{ recipe.author }}'s</h5>
          <h2 class="white-text center">{{ recipe.title }}</h2>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col s5">
        <ul class="collection">
          <li class="collection-item"><h6>Ingredients</h6></li>
          <li v-for="(ingred, index) in recipe.ingredients" :key="index" class="collection-item">
            {{ ingred }}
          </li>
        </ul>
      </div>
      <div class="col s7">
        <div class="card-panel deep-purple">
          <span class="white-text">{{ recipe.description }}</span>
        </div>
        <ul class="collection">
          <li class="collection-item"><h6>Instructions</h6></li>
          <li v-for="(instruct, index) in recipe.instructions" :key="index" class="collection-item">
            {{index+1}}.   {{ instruct }}
          </li>
        </ul>
      </div>
    </div>
    <div class="row">
      <ul class="comments collection">
        <li v-for="(comment, index) in comments" :key="index">
          <span class="deep-purple-text">{{ comment.from}} </span>
          <span class="grey-text right">{{ comment.time }}</span>
          <div class="grey-text text-darken-2">{{ comment.content}}</div>
        </li>
      </ul>
      <form @submit.prevent="addComment">
        <div class="field">
          <label for="comment">Add a comment</label>
          <input type="text" name="comment" v-model="newComment">
          <p v-if="feedback" class="red-text center">Feedback</p>
        </div>
      </form>
    </div>
  </div>

</template>

<script>
  import db from '@/firebase/init'
  import firebase from 'firebase'
    export default {
        name: "ProfileRecipe",
      data(){
        return {
          newComment: null,
          feedback: null,
          user: null,
          comments: [],
          recipes: [],
          recipe: {
            title: null,
            img_url: null,
            description: null,
            recipe_id: null,
            author: null,
            userId: null
          }
        }
      },
      created(){
        let recRef = db.collection('recipes')
        let userRef = db.collection('users')

        //get current user
        userRef.where('user_id', '==', firebase.auth().currentUser.uid).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              this.user = doc.data()
              this.user.id = doc.id
            })
          })

        //Recipe
        recRef.where('recipe_id', '==', this.$route.params.id).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              let resData = doc.data()
              this.recipe = {
                userId: resData.user_id,
                title: resData.title,
                img_url: resData.img_url,
                description: resData.description,
                recipe_id: this.$route.params.id,
                author: resData.user,
                ingredients: resData.ingredients,
                instructions: resData.instructions
              }
            })
        })

        //comments
        db.collection('comments').where('recipe', '==', this.$route.params.id)
          .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach(change => {
              if (change.type == 'added'){
                this.comments.unshift({
                  from: change.doc.data().from,
                  content: change.doc.data().content,
                  time: (new Date(change.doc.data().time)).toDateString()
                })
              }
            })
          })
      },
      methods: {
        addComment(){
          if (this.newComment){
            this.feedback = null
            let fromUser = this.user.id.toString().replace(/-/g," ").replace(/^\w/, c => c.toUpperCase())
            db.collection('comments').add({
              recipe: this.$route.params.id,
              content: this.newComment,
              time: Date.now(),
              from: fromUser
            }).then(() => {
              this.newComment = null
            })
          } else {
            this.feedback = 'You must enter a comment to add it'
          }
        }
      }
    }
</script>

<style scoped>
  .profile-recipe .back-link {
    margin: 20px 0 20px 0;
  }
  .jumbotron {
    margin: 0 !important;
    padding: 0;
    background: black no-repeat center center;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
    margin: 30px 0 30px 0;
    border-radius: 10px;
  }

  .jumbotron-darken {
    background-color: rgba(0, 0, 0, 0.5);
    padding: 100px;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
  .comments li {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }


</style>
