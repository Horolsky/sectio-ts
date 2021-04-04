import RatioMap from '../ratiomap';
import Canon from '../canon'
import { expect, test } from '@jest/globals';
import { S_COMMA } from '../constants';

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