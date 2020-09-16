// @refresh reset
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MapView from "react-native-maps";
import * as firebase from "firebase";
import "firebase/firestore";
import axios from "axios";
import breezy_key from "./breezy.js";
import Map from "./Map.js";
import HomeScreen from "./HomeScreen.js";

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

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={Map} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "orange",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default App;
