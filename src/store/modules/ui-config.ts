import Vue from 'vue';
import { State, Module, Action, Getter,createVuexStore, registerModule, useModule, Mutation, unregisterModule } from 'vuex-simple';
export default class UiConfig extends Vue {
    @State()
    public mode: 0 | 1 | 2;
    constructor(){
        super()
        this.mode = 0;
    } 
}