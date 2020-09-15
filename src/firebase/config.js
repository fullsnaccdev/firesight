import * as firebase from "firebase";

// Optionally import the services that you want to use
//import "firebase/auth";
//import "firebase/database";
//import "firebase/firestore";
//import "firebase/functions";
//import "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA7meYAgCE0tMJesb_fFvwNqM0jnnkuE6M",
  authDomain: "firetracker-b2b24.firebaseapp.com",
  databaseURL: "https://firetracker-b2b24.firebaseio.com",
  projectId: "firetracker-b2b24",
  storageBucket: "firetracker-b2b24.appspot.com",
  messagingSenderId: "663538945012",
  appId: "1:663538945012:ios:f9e263c99b22b3c17507a1",
};
// measurementId: "G-measurement-id",

firebase.initializeApp(firebaseConfig);
