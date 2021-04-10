import Vue from 'vue'
import Vuex from 'vuex'
import { createVuexStore, State, Module } from 'vuex-simple';

import {CanonData} from './modules/canon-data'
import tabsData from './modules/tabs-data'
import uiConfig from './modules/ui-config'

Vue.use(Vuex)

export class RootModule {
  @State()
  public tab = 0;

  @Module()
  public canon = new CanonData(this);
}
export const STORE = new RootModule()
export default createVuexStore(STORE, {
  strict: false,
  modules: {},
  plugins: []
});


