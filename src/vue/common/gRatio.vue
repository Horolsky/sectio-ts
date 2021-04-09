<template>
<div
:innerHTML="html_view"/>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import { get_tm_map, TempMap } from '@/core/tempmap';
import { S_COMMA } from '@/core/constants';

@Options({ 
  name: 'gRatio',
  props: {
    ratio: {
      type: Object,
      default: {
        num: 1, den: 1, tmp: 0
      }
    },
    kappa: {
      type: Boolean,
      default: false
    },
    comma: {
      type: Number,
      default: S_COMMA
    }
  },
  data: () => ({
    latex_on: true
  }),
  computed: {
    html_view(){
      let tmp = "";
      if (this.ratio.tmp != 0) {
        const tm = get_tm_map(this.comma) as TempMap;
        const {sgn, int, num, den} = tm.get_frac(this.ratio.tmp);
        const kappa = this.kappa ? " k" : "";
        tmp = num == 0 
              ? `${sgn > 0 ? '+' : '-'}${int || ''}${kappa}`.sup()
              : `${sgn > 0 ? '+' : '-'}${int || ''}<sup>${num}</sup>/<sub>${den}</sub>${kappa}`.sup();
      }
      return `${this.ratio.num}:${this.ratio.den}${tmp}`;
    }
  }
})

export default class Fraction extends Vue {}
</script>

<style>
  /*@import "../node_modules/katex/dist/katex.min.css";*/
</style>
