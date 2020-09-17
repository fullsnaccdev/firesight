import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MapView, { Marker, Callout } from "react-native-maps";
import { Constants } from "expo";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import * as firebase from "firebase";
import "firebase/firestore";
import axios from "axios";
import breezy_key from "./breezy.js";
import google_key from "./google_key.js";

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

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
// const firesRef = db.collection("fires");
const testRef = db.collection("test").doc("1");

export default class Map extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      lat: "",
      lon: "",
      fires: [],
      airQuality: {},
      location: null,
      errorMessage: null,
    };
    // this.getData = this.getData.bind(this);
    this.queryBreezy = this.queryBreezy.bind(this);
    this.getCityCoords = this.getCityCoords.bind(this);
  }
  componentDidMount() {
    this._isMounted = true;
    this.findCurrentLocation();
    // this.getData();
  }

  findCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        this.setState(
          {
            lat: latitude,
            lon: longitude,
          },
          () => this.queryBreezy()
        );
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }

  findCurrentLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== "granted") {
      this.setState({
        errorMessage: "Permission to access location was denied",
      });
    }

    let location = await Location.getCurrentPositionAsync();
    this.setState({ location });
  };

  queryBreezy() {
    axios
      .get(
        `https://api.breezometer.com/fires/v1/current-conditions?lat=${this.state.lat}&lon=${this.state.lon}&key=${breezy_key}&units=imperial&radius=62`
      )
      .then((results) => {
        if (this._isMounted) {
          this.setState({
            fires: results.data.data.fires,
          });
        }
      })
      .then(() => {
        axios
          .get(
            `https://api.breezometer.com/air-quality/v2/current-conditions?lat=${this.state.lat}&lon=${this.state.lon}&key=${breezy_key}&features=local_aqi`
          )
          .then((results) => {
            console.log("airQuality: ", results.data.data.indexes);
            if (this._isMounted) {
              this.setState({
                airQuality: results.data.data.indexes.usa_epa,
              });
            }
          });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  // getData() {
  //   testRef
  //     .get()
  //     .then(function (doc) {
  //       if (doc.exists) {
  //         return doc.data();
  //       } else {
  //         console.log("No such document!");
  //       }
  //     })
  //     .then(({ lat, lon }) => {
  //       this.setState(
  //         {
  //           lat: Number(lat),
  //           lon: Number(lon),
  //         },
  //         () => this.queryBreezy()
  //       );
  //     })
  //     .catch(function (error) {
  //       console.log("Error getting document:", error);
  //     });
  // }

  getCityCoords() {
    axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.location}&key=${google_key}`)
      .then((results) => {
        console.log('location', this.state.location);
        console.log('results: ', results.results)
        this.setState({
          lat: results.data.results[0].geometry.location.lat,
          lon: results.data.results[0].geometry.location.lng
        })
      })
      .then(() => this.queryBreezy())
      .catch((error) => console.error(error))
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  changeHandler(text) {
    this.setState({
      location: text,
    });
  }

  calloutPress() {
    console.log("hello!");
  }

  render() {
    if (this.state.lat === "") {
      return (
        <View style={styles.container}>
          <TextInput
            style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
            onChangeText={(text) => {
              this.changeHandler(text);
            }}
            value={this.state.location}
            placeholder="Please Input A City"
          ></TextInput>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => { this.getCityCoords() }}
          >
            <Text style={styles.submitButtonText}> Submit </Text>
          </TouchableOpacity>
        </View>
      );
    } else if (this.state.fires.length === 0) {
      return (
        <MapView
          style={styles.container}
          initialRegion={{
            latitude: this.state.lat,
            longitude: this.state.lon,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        ></MapView>
      );
    } else {
      return (
        <MapView
          style={styles.container}
          initialRegion={{
            latitude: this.state.lat,
            longitude: this.state.lon,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {this.state.fires.map((fire, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: fire.position.lat,
                longitude: fire.position.lon,
              }}
              image={require("./assets/clip1.png")}
              onCalloutPress={() => this.calloutPress()}
            >
              <Callout>
                <View>
                  <Text style={styles.calloutTitle}>
                    {fire.details !== null && fire.details.fire_name !== null ? fire.details.fire_name : null}
                  </Text>
                  <Text style={styles.calloutDescription}>
                    {fire.details !== null && fire.details.percent_contained !== null ? `${fire.details.percent_contained}% contained` : null}
                  </Text>
                  <Text style={styles.calloutDescription}>
                    {fire.details !== null && fire.details.size.value !== null ? `${fire.details.size.value} acres` : null}
                  </Text>
                </View>
              </Callout>
            </Marker>
          ))}

          <Marker
            coordinate={{ latitude: this.state.lat, longitude: this.state.lon }}
            // title={"Air Quality"}
            onCalloutPress={() => this.calloutPress()}
          // description={`${this.state.airQuality.category} : ${this.state.airQuality.aqi}`}
          >
            <Callout>
              <View>
                <Text style={styles.calloutTitle}>{"Air Quality"}</Text>
                <Text style={styles.calloutDescription}>{`AQI: ${this.state.airQuality.aqi}\n${this.state.airQuality.category}`}</Text>
              </View>
            </Callout>
          </Marker>

        </MapView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 23,
  },

  input: {
    margin: 15,
    height: 40,
    borderColor: "#7a42f4",
    borderWidth: 1,
    padding: 10
  },
  submitButton: {
    backgroundColor: "orange",
    padding: 10,
    margin: 15,
    height: 40,
  },
  submitButtonText: {
    color: "white",
  },
  calloutTitle: {
    fontSize: 17,
    marginBottom: 5,
    fontWeight: "bold"
  },
  calloutDescription: {
    fontSize: 14
  }
});
