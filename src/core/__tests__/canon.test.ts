import RatioMap from '../ratiomap';
import Canon from '../canon';
import { expect, test } from '@jest/globals';
import { S_COMMA } from '../constants';
import db from '../../db/firestore';

test('creating Canon inst, correct: default values', ()=>{
    const x = new Canon();
    expect(x.ratiomap instanceof RatioMap).toBe(true);
    expect(x.period).toBe(1);
    expect(x.comma).toBe(S_COMMA);
})

test('creating Canon inst, corrupted input: section id', ()=>{
    const x = () => {new Canon({sections: [{id: -1}]});}
    expect(x).toThrowError();
})

test('creating Canon from db doc', async ()=>{
    const doc = await db.collection("schemata").doc('just').get()
    if (doc.exists) {
        const c = new Canon(doc.data());
        expect(c.limit).toBe(5);
        c.update_relations(6, 0, null);
        expect(c.data.sections.length).toBe(6);
    }
    expect(doc.exists).toBe(true);
})