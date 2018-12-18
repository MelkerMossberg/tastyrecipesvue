<template>
  <div class="view-profile container">
    <div v-if="profile">
      <h2 class="deep-purple-text center">{{ profile.alias }}'s Wall</h2>

      <div class="row">
        <div v-for="(recipe, index) in recipes" :key="index" class="col s4">
          <div class="card ">
            <div class="card-image">
              <img v-bind:src="recipe.img_url">
              <span class="card-title">{{ recipe.title }}</span>
            </div>
            <div class="card-content">
              <p>{{ recipe.description }}</p>
            </div>
            <div class="card-action">
              <router-link v-bind:to="{name: 'ProfileRecipe', params: {id: recipe.recipe_id} }"> See full recipe</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="userIsAuthor" class="row">
      <h5>Add a new recipe</h5>
      <form @submit.prevent="addRecipe" class="col s12">
        <div class="input-field col s6">
          <input placeholder="Add a title" id="title" type="text" class="validate" name="title" v-model="newRecipe.title">
        </div>
        <div class="input-field col s6">
          <input placeholder="Add an image URL" id="img_url" type="text" class="validate" name="img_url" v-model="newRecipe.img_url">
        </div>
        <div class="input-field col s12">
          <input placeholder="Add a description" id="description" type="text" class="validate" name="description" v-model="newRecipe.description">
        </div>
        <div class="input-field col s12">
          <input placeholder="Add a ingredients separated by '. '" id="ingredients" type="text" class="validate" name="ingredients" v-model="newRecipe.ingredients">
        </div>
        <div class="input-field col s12">
          <input placeholder="Add a instructions separated by '. '" id="instructions" type="text" class="validate" name="instructions" v-model="newRecipe.instructions">
        </div>

        <p>
          <input class="btn"
            type="submit"
            value="Submit"
          >
        </p>
      </form>
    </div>
  </div>
</template>

<script>
  import db from '@/firebase/init'
  import firebase from 'firebase'
  import slugify from 'slugify'

    export default {
        name: "ViewProfile",
      data(){
          return {
            profile: null,
            newComment: null,
            feedback: null,
            user: null,
            userIsAuthor: false,
            comments: [],
            recipes: [],
            newRecipe: {
              title: null,
              img_url: null,
              description: null,
              recipe_id: null,
              ingredients: null,
              instructions: null
            }
          }
      },
      created(){
          let ref = db.collection('users')

        //get current user
        ref.where('user_id', '==', firebase.auth().currentUser.uid).get()
          .then(snapshot => {
            snapshot.forEach(doc => {
              this.user = doc.data()
              this.user.id = doc.id
              if (this.user.id === this.$route.params.id){
                this.userIsAuthor = true
              }
            })
          })

        //profile data
        ref.doc(this.$route.params.id).get()
          .then(user => {
            this.profile = user.data()
          })

        //recipes
        db.collection('recipes').where('user','==', this.$route.params.id).onSnapshot((snapshot) => {
          snapshot.docChanges().forEach(change => {
            if (change.type == 'added'){
              let rData = change.doc.data();
              console.log(rData)
              let newRecipe = {
                recipe_id: rData.recipe_id,
                title: rData.title,
                description: rData.description,
                img_url: rData.img_url,
              }
              this.recipes.unshift(newRecipe)
            }
          })
        })
      },
      methods: {
        addRecipe(){
            console.log('AddRecipe')
          if (this.newRecipe.title && this.newRecipe.img_url && this.newRecipe.description){
            this.feedback = null
            db.collection('recipes').add({
              user: this.$route.params.id,
              title: this.newRecipe.title,
              img_url: this.newRecipe.img_url,
              description: this.newRecipe.description,
              ingredients: this.newRecipe.ingredients.split('. '),
              instructions: this.newRecipe.instructions.split('. '),
              recipe_id: slugify(this.newRecipe.title, {
                            replacement: '-',
                            remove: /[$*_+~.()'"!\-:@]/g,
                            lower: true
              })
            }).then(() => {
                this.newRecipe.title = null,
                this.newRecipe.img_url = null,
                this.newRecipe.description = null,
                this.newRecipe.ingredients = null
                this.newRecipe.instructions = null
            })
          } else {
            //this.feedback = 'You must enter a comment to add it'
          }
        }
      }
    }
</script>

<style scoped>
  .view-profile {
    padding-top: 40px;
  }
.view-profile .card {
  padding: 20px;
  margin-top: 60px;
}
  .view-profile h2{
    font-size: 2em;
    margin-top: 0;
  }
  .view-profile li {
    padding: 10px;
    border-bottom: 1px solid #eee;
  }
  .view-profile .card-content {
    padding: 20px 0px;
    font-size: 0.9em;
  }

</style>

