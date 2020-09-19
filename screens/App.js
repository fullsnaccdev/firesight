// @refresh reset
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MapView from "react-native-maps";
import * as firebase from "firebase";
import "firebase/firestore";
import axios from "axios";
import breezy_key from "../breezy_key.js";
import Map from "./Map.js";
import HomeScreen from "./HomeScreen.js";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" style={{backgroundColor: 'red'}}>
          <Stack.Screen name="Firesight" component={HomeScreen} />
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
