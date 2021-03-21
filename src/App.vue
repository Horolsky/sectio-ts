<template>
<p>{{msg}}</p>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import firebase from 'firebase/app';
import 'firebase/firestore';

@Options({ 
  name: 'App',
  components: {
    
  },
  data: () => ({
    firebase: null,
    db: null,
    msg: "Sectio Canonis 1.0.0"
  }),
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      //FIRESTORE
      this.firebase = firebase;
      firebase.initializeApp({
        apiKey: "AIzaSyBCNrnag3orw2BTIn4hPR2i_n-5eEacr2w",
        authDomain: "sectio-canonis.firebaseapp.com",
        databaseURL: "https://sectio-canonis.firebaseio.com",
        projectId: "sectio-canonis",
        storageBucket: "sectio-canonis.appspot.com",
        messagingSenderId: "674839962809",
        appId: "1:674839962809:web:787b93e13ff8c63c2d6768",
        measurementId: "G-MRG29FW0RK"
      });
      this.db = firebase.firestore();
    }
  }
})

export default class App extends Vue {}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
