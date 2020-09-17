import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
// import { Constants } from "expo";
// import * as Location from "expo-location";
// import * as Permissions from "expo-permissions";
import MapView from "react-native-maps";
import * as firebase from "firebase";
import "firebase/firestore";
import axios from "axios";
import breezy_key from "../breezy.js";
import Map from "./Map.js";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // location: null,
      // errorMessage: null,
    };
  }

  // findCurrentLocation() {
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       const latitude = JSON.stringify(position.coords.latitude);
  //       const longitude = JSON.stringify(position.coords.longitude);
  //       this.setState({
  //         latitude,
  //         longitude,
  //       });
  //     },
  //     { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
  //   );
  // }

  // findCurrentLocationAsync = async () => {
  //   let { status } = await Permissions.askAsync(Permissions.LOCATION);

  //   if (status !== "granted") {
  //     this.setState({
  //       errorMessage: "Permission to access location was denied",
  //     });
  //     console.log("inside findcurrentasync", this.state);
  //   }

  //   let location = await Location.getCurrentPositionAsync();
  //   this.setState({ location });
  // };

  render() {
    // let text = "";
    // if (this.state.errorMessage) {
    //   text = this.state.errorMessage;
    // } else if (this.state.location) {
    //   text = JSON.stringify(this.state.location);
    // }
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <TouchableOpacity>
          <Text>Welcome to Firesight</Text>
          {/* <Text>{text}</Text> */}
        </TouchableOpacity>
        <Button
          title="Go to Map"
          onPress={() => this.props.navigation.navigate("Map")}
        />
      </View>
    );
  }
}

// function HomeScreen({ navigation }) {
//   return (
//     <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//       <Text>Home Screen</Text>
//       <Button title="Go to Map" onPress={() => navigation.navigate("Map")} />
//     </View>
//   );
// }

export default HomeScreen;
