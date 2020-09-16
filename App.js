// @refresh reset
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps";
import * as firebase from "firebase";
import "firebase/firestore";
import axios from "axios";
import breezy_key from "./breezy.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7meYAgCE0tMJesb_fFvwNqM0jnnkuE6M",
  authDomain: "firetracker-b2b24.firebaseapp.com",
  databaseURL: "https://firetracker-b2b24.firebaseio.com",
  projectId: "firetracker-b2b24",
  storageBucket: "firetracker-b2b24.appspot.com",
  messagingSenderId: "663538945012",
  appId: "1:663538945012:ios:f9e263c99b22b3c17507a1",
  measurementId: "G-L1JSJ6ES4T",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
// const firesRef = db.collection("fires");
const testRef = db.collection("test").doc("1");

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: "",
      lon: "",
      fires: [],
    };
    this.getData = this.getData.bind(this);
    this.queryBreezy = this.queryBreezy.bind(this);
  }
  componentDidMount() {
    this.getData();
  }

  queryBreezy() {
    axios
      .get(
        `https://api.breezometer.com/fires/v1/current-conditions?lat=${this.state.lat}&lon=${this.state.lon}&key=${breezy_key}&radius=100`
      )
      .then((results) => {
        console.log("this starts here!", results.data.data.fires[0]);
        this.setState({
          fires: results.data.data.fires,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  getData() {
    testRef
      .get()
      .then(function (doc) {
        if (doc.exists) {
          return doc.data();
        } else {
          console.log("No such document!");
        }
      })
      .then(({ lat, lon }) => {
        this.setState(
          {
            lat: Number(lat),
            lon: Number(lon),
          },
          () => this.queryBreezy()
        );
      })
      .catch(function (error) {
        console.log("Error getting document:", error);
      });
  }

  render() {
    if (this.state.lat === "") {
      return (
        <View>
          <Text>loading...</Text>
        </View>
      );
    } else {
      return (
        // <View style={styles.container}>
        //   <Text>welcome to firesight</Text>
        //   <StatusBar style="auto" />
        // </View>
        <MapView
          style={styles.container}
          initialRegion={{
            latitude: this.state.lat,
            longitude: this.state.lon,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "orange",
    alignItems: "center",
    justifyContent: "center",
  },

  firstBox: {
    backgroundColor: "blue",
  },
});
