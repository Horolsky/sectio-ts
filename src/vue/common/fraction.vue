<template>
<!--<div v-katex="'\\frac{a_i}{1+x}'"></div>-->
<div
:innerHTML="frac_view"/>
<!--<div ref="frac_cont"></div>-->
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { frac_html, frac_latex } from '../../utils/frac-view';
import katex from 'katex'

@Options({ 
  name: 'fraction',
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
  mounted() {
    //this.render();
  },
  methods: {
    render() {
      try {
        this.frac_view = frac_latex(this.frac, this.force_sign, this.proper)
        if (this.kappa) this.frac_view += '\\kappa';
        katex.render(this.frac_view, this.$refs.frac_cont, {
        throwOnError: true
        });
      }
      catch {
        this.frac_view = frac_html(this.frac, this.force_sign, this.proper);
        if (this.kappa) this.frac_view += 'k';
        this.$refs.frac_cont.innnerHTML = this.frac_view;
      }
    }
  },
  computed: {
    frac_view: function(){
      let _view;
      try {
        _view = frac_latex(this.frac, this.force_sign, this.proper);
        if (this.kappa) _view += '\\kappa';
        _view = katex.renderToString(_view, {
          throwOnError: true
        })
      }
      catch {
        _view = frac_html(this.frac, this.force_sign, this.proper);
        if (this.kappa) _view += 'k';
      }
      return _view;
    }
  }
})

export default class Fraction extends Vue {}
</script>

<style>
  /*@import "../node_modules/katex/dist/katex.min.css";*/
</style>
