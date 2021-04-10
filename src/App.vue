<template>
  <div id="app">
    <p>{{msg}}</p>
    <gRatio
      :ratio="test_gRatio"
    />
  </div>
  
</template>

<script lang="ts">
import Vue from 'vue';
import gRatio from './components/gRatio.vue';
import { STORE } from './store';

export default Vue.extend({
  name: 'App',
  components: {
    gRatio
  },
  data: () => ({
    test_frac: [5,4],
    test_proper: false,
    test_force: false,
    test_kappa: false,
    //test_gRatio: {num: 3, den: 2, tmp: -0.004480476999315579 },
    msg: "Sectio Canonis 1.0.0"
  }),
  computed : {
    test_gRatio() {
      const rels = STORE.canon.relations;//this.$store.getters["canon/relations"];
      const ratio = rels ? rels?.[0][2].ratio : {frac: [1,1], temperament: 0};
      
      return { num: ratio.frac[0], den: ratio.frac[1], tmp: ratio.temperament };
    }
  }
});
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
