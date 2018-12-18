import firebase from 'firebase'
import firestore from 'firebase/firestore'

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCQ-i8evnEewVt9dQI_ZEzZ7qm0zObCCEA",
  authDomain: "tasty-recipes-1fadd.firebaseapp.com",
  databaseURL: "https://tasty-recipes-1fadd.firebaseio.com",
  projectId: "tasty-recipes-1fadd",
  storageBucket: "",
  messagingSenderId: "376127293055"
};

const firebaseApp = firebase.initializeApp(config);
firebaseApp.firestore().settings({timestampsInSnapshots: true})

export default firebaseApp.firestore()
