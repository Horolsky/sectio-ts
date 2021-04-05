import { expect, test } from '@jest/globals';
import db from '../firestore';


test("DB base test", async () => {
    const docref = db.collection('schemata').doc('just');
    const doc = await docref.get();
    expect(doc.exists).toBe(true);
})