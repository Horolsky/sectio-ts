import Vue from 'vue';
import { State, Module, Action, Getter,createVuexStore, registerModule, useModule, Mutation, unregisterModule } from 'vuex-simple';
export default class UiConfig extends Vue {
    /** ratio view mode */
    @State()
    public rmode: 0 | 1 | 2 = 0;
    /** infochart orientation */
    @State()
    public IG_portrait = true;
    /** dark mode */
    @State()
    public dark = true;

    @Mutation()
    private _UPDATE({rmode, IG_portrait, dark}: {
        rmode?: 0 | 1 | 2,
        IG_portrait?: boolean,
        dark?: boolean
    }){
        if (rmode != undefined && [0,1,2].indexOf(rmode) >= 0) this.rmode = rmode;
        if (IG_portrait != undefined && typeof IG_portrait == "boolean") this.IG_portrait = IG_portrait;
        if (dark != undefined && typeof dark == "boolean") this.dark = dark;
    }
    @Action()
    public async UPDATE(payload: Record<string, unknown>){
        this._UPDATE(payload);
    }
}