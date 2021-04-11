import Vue from 'vue'
import Vuex from 'vuex'
import { State, Module, createVuexStore, registerModule, useModule, unregisterModule } from 'vuex-simple';

import Canon from './modules/canon'
import UiConfig from './modules/ui-config'
import UiState from './modules/ui-state'

Vue.use(Vuex)

export class RootModule extends Vue {
  @State()
  public current = -1;
  @State()
  readonly canons = new Array<number>();
  @Module()
  public ui_config = new UiConfig();
  @Module()
  public ui_state = new UiState();
}

const _root_store = new RootModule()
const $store =  createVuexStore(_root_store, {
  strict: false,
  modules: {},
  plugins: []
});

export const LOAD_CANON = (data: canon_schema) => {
  data.id = (()=>{
    let id = 0;
    if (_root_store.canons.length > 0)  {
      const pool = _root_store.canons.slice().sort();
      for (let i = 0; i < pool.length; i++){
        if (pool[i] > id) break;
        id = pool[i]+1;
      }
    }
    return id;
  })()
  registerModule($store, [`canon-${data.id}`], new Canon(data));
  _root_store.current = data.id;
  _root_store.canons.push(data.id);
}

export const CURRENT_CANON = () => {
  return _root_store.current >= 0
    ? useModule<Canon>($store, [`canon-${_root_store.current}`])
    : null;
}
export const UNLOAD_CANON = (id: number) => {
  const i = _root_store.canons.indexOf(id);
  if (i >= 0) {
    _root_store.canons.splice(i, 1);
    if (_root_store.current == id) {
      _root_store.current = 
      i > 0 
        ?_root_store.canons[i-1] 
        : _root_store.canons.length > 0 
          ? _root_store.canons[0]
          : -1;
    }
    unregisterModule($store, [`canon-${id}`]);
  }
};
export const STORE = {
  LOAD: LOAD_CANON,
  UNLOAD: UNLOAD_CANON,
  get CANON() { return CURRENT_CANON(); },
  get POOL() {return _root_store.canons.map(id => {
    return {
      id,
      code: $store.state[`canon-${id}`].data.code
    }
  }); },
  set CURRENT(id: number) {
    if (_root_store.canons.indexOf(id) >= 0) _root_store.current = id;
   },
  get CURRENT() { return _root_store.current; },
  get CONFIG() { return _root_store.ui_config; },
  get UI_STATE() { return _root_store.ui_state; }
}
export default $store;
