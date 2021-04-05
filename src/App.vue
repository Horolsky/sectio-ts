<template>
<p>{{msg}}</p>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';


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
      //
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
