import Vue from 'vue'
import App from './App.vue'
import { decimal_to_fraction } from './core/math';
import db from './db/firestore';
import store, { STORE, LOAD_CANON, CURRENT_CANON, UNLOAD_CANON } from './store';

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
      STORE.LOAD(data);
      console.log(STORE);
      //console.log(GET_CURRENT);
      //console.log(UNLOAD);
      //const c = new Canon(data);
      //console.log(c);
      //console.log(c.print_relmt_e());
      //console.log(c.print_relmt_r());
  }
})();
console.log(decimal_to_fraction);
