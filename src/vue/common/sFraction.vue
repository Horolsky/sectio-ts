<template>
<div
:innerHTML="frac_view"/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { frac_html } from '../../utils/frac-view';

@Options({ 
  name: 'sFraction',
  props: {
    frac: Array,
    force_sign: Boolean,
    proper: Boolean,
    kappa: Boolean
  },
  data: () => ({
    //frac_view: '',
    latex_on: true
  }),
  computed: {
    frac_view: function(){
      let _view = frac_html(this.frac, this.force_sign, this.proper);
        if (this.kappa) _view += 'k';
      return _view;
    }
  }
})

export default class Fraction extends Vue {}
</script>

<style>
  /*@import "../node_modules/katex/dist/katex.min.css";*/
</style>
