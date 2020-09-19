import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LinearGradient } from 'expo-linear-gradient';
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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFA03C',
        }}>
        <LinearGradient
          // Background Linear Gradient
          colors={['white', 'transparent']}
          // rgba(0,0,0,0.8)
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 500,
          }}
        />
        <Image source={require("../assets/logo_transparent.png")} style={styles.logoStyle} />
        <Button
          title="Continue as Guest"
          color='#581915'
          onPress={() => this.props.navigation.navigate("Map")}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonStyle: {
    color: 'brown',
    borderWidth: .5,
    borderRadius: 15
  },
  logoStyle: {
    height: '30%',
    width: '90%'
  }
})


export default HomeScreen;
