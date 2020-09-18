import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
// import { Constants } from "expo";
// import * as Location from "expo-location";
// import * as Permissions from "expo-permissions";
import {
  Header,
  Container,
  Icon,
  Item,
  Input,
} from 'native-base';

import MapView from "react-native-maps";
import * as firebase from "firebase";
import "firebase/firestore";
import axios from "axios";
import breezy_key from "../breezy_key.js";
import Map from "./Map.js";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <Container>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <TouchableOpacity>
            <Text>Welcome to Firesight</Text>
          </TouchableOpacity>
          <Button
            title="Continue as Guest"
            onPress={() => this.props.navigation.navigate("Map")}
          />
        </View>
      </Container>
    );
  }
}


export default HomeScreen;
