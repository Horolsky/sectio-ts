import {State, Mutation, Action, Getter} from 'vuex-simple';

import Canon from "@/core/canon";
import {RootModule} from '@/store/index';

export class CanonData  {
    constructor(private root: RootModule){}
    @State()
    public id = 0;
    @State()
    public canon?: Canon;
    @State()
    public _relations?: interval[][];
    @State()
    public _intervals?: intrv_dict;
    @Mutation()
    private _upd(){
        this._relations = this.canon?.relations;
        this._intervals = this.canon?.intervals;
    }
    @Mutation()
    private _LOAD(data: canon_schema){
        this.canon = new Canon(data);
        this._upd();
    }
    @Action()
    public async LOAD(data: canon_schema){
        this._LOAD(data);
    }
    @Mutation()
    private _ADD_SEC_SEC(payload: any){
        return this.canon?.add_section(payload);
        this._upd();
    }
    @Action()
    public ADD_SEC_SEC({ name, code, parent = 0, rtp }: {
        name?: string,
        code?: string,
        parent?: number,
        rtp: number
      }){
        return this._ADD_SEC_SEC({name, code, parent, rtp})
    }
    @Mutation()
    private _EDIT_SEC(payload: any){
        return this.canon?.edit_section(payload);
        this._upd();
    }
    @Action()
    public async EDIT_SEC({ id, name, code, parent, rtp }: {
        id: number
        name?: string,
        code?: string,
        parent?: number,
        rtp?: number
      }){
        return this._EDIT_SEC({id, name, code, parent, rtp});
    }
    @Mutation()
    private _DELETE_SEC(id: number){
        return this.canon?.delete_section(id);
        this._upd();
    }
    @Action()
    public async DELETE_SEC(id: number){
        return this._DELETE_SEC(id);
    }
    @Mutation()
    private _DROP_SEC(){
        return this.canon?.drop_sections();
        this._upd();
    }
    @Action()
    public async DROP_SEC(){
        return this._DROP_SEC();
    }
    @Mutation()
    private _UPDATE_PARAMS(payload: any){
        return this.canon?.update_params(payload);
        this._upd();
    }
    @Action()
    public async UPDATE_PARAMS({ period, comma, range, limit }:{
        period?: number | fraction,
        comma?: number | fraction,
        range?: number,
        limit?: plimit | null 
      }){
        return this._UPDATE_PARAMS({ period, comma, range, limit });
    }
    @Mutation()
    private _UPDATE_INFO(payload: any){
        return this.canon?.update_params(payload)
    }
    @Action()
    public async UPDATE_INFO({ id, name, code, description, tags }:{
        id?: number,
        name?: string,
        code?: string,
        description?: string,
        tags?: string[]
      }){
        return this._UPDATE_INFO({ id, name, code, description, tags });
    }
    @Getter()
    public get relations(){
        return this._relations;
    }
    @Getter()
    public get intervals(){
        return this._intervals;
    }
    @Getter()
    public get pitches(){
        return this.canon?.cache.intervals;
    }
}