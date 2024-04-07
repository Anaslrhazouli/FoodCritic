const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');


const firebaseConfig = {
    apiKey: "AIzaSyCO0E_JgSkgC9ZTj_ioPn3aBGxq39efBRM",
    authDomain: "food-critic-e3d14.firebaseapp.com",
    projectId: "food-critic-e3d14",
    storageBucket: "food-critic-e3d14.appspot.com",
    messagingSenderId: "1012255613844",
    appId: "1:1012255613844:web:5908382ce7de7fc3f6e581"
};

// Initialize Firebase before accessing Firestore
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Export the functions individually
module.exports = {
    firebase,
    db,
};
