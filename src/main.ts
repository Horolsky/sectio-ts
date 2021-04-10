import Vue from 'vue'
import App from './App.vue'
import Canon from './core/canon';
import db from './db/firestore';
import store from './store'

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
      const c = new Canon(data);
      console.log(c);
      console.log(c.print_relmt_e());
      console.log(c.print_relmt_r());
  }
})();