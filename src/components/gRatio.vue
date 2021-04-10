<template>
<div
v-html="html_view"
/>
</template>

<script lang="ts">
import Vue from 'vue';
import { get_tm_map, TempMap } from '@/core/tempmap';
import { S_COMMA } from '@/core/constants';

export default Vue.extend({ 
  name: 'gRatio',
  props: {
    ratio: {
      type: Object,
      default: () => {
        return { num: 1, den: 1, tmp: 0 };
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
      const vue = this as any;
      if (vue.ratio.tmp != 0) {
        const tm = get_tm_map(vue.comma) as TempMap;
        const {sgn, int, num, den} = tm.get_frac(vue.ratio.tmp);
        const kappa = this.kappa ? " k" : "";
        tmp = num == 0 
              ? `${sgn > 0 ? '+' : '-'}${int || ''}${kappa}`.sup()
              : `${sgn > 0 ? '+' : '-'}${int || ''}<sup>${num}</sup>/<sub>${den}</sub>${kappa}`.sup();
      }
      return `${vue.ratio.num}:${vue.ratio.den}${tmp}`;
    }
  }
})

</script>

<style>
  
</style>
