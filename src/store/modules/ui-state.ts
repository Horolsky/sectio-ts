import Vue from 'vue';
import { State, Module, Action, Getter,createVuexStore, registerModule, useModule, Mutation, unregisterModule } from 'vuex-simple';
export default class UiState extends Vue {
    @State()
    public winW = 0;
    /** window height */
    @State()
    public winH = 0;
    @State()
    public dialogIsActive = false;
    @State()
    public touchOn = false;
}