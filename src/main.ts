import Vue from 'vue'
import App from './App.vue'
import Canon from './core/canon';
import { decimal_to_fraction } from './core/math';
import db from './db/firestore';
import store, { STORE } from './store';

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App)
}).$mount('#app');


(async() =>{
  const doc = await db.collection("schemata").doc('just').get()
  if (doc.exists) {
      const data = doc.data() as canon_schema;
      data.params.range = 300;
      STORE.canon.LOAD(data);
      console.log(STORE);
      //const c = new Canon(data);
      //console.log(c);
      //console.log(c.print_relmt_e());
      //console.log(c.print_relmt_r());
  }
})();
console.log(decimal_to_fraction);
