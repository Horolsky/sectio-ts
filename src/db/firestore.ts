import firebase from 'firebase/app';
import 'firebase/firestore';

const fb = firebase;
fb.initializeApp({
    apiKey: "AIzaSyBCNrnag3orw2BTIn4hPR2i_n-5eEacr2w",
    authDomain: "sectio-canonis.firebaseapp.com",
    databaseURL: "https://sectio-canonis.firebaseio.com",
    projectId: "sectio-canonis",
    storageBucket: "sectio-canonis.appspot.com",
    messagingSenderId: "674839962809",
    appId: "1:674839962809:web:787b93e13ff8c63c2d6768",
    measurementId: "G-MRG29FW0RK"
});
const db = fb.firestore();
export default db;
