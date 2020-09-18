import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TextInput, TouchableOpacity, Image } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MapView, { Marker, Callout } from "react-native-maps";
// import { SearchBar } from 'react-native-elements';
import {
  Header,
  Container,
  Icon,
  Item,
  Input,
} from 'native-base';
import { Constants } from "expo";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import * as firebase from "firebase";
import "firebase/firestore";
import firekey from '../firekey2.js'
import axios from "axios";
import breezy_key from "../breezy.js";
import google_key from "../google_key2.js";

const Stack = createStackNavigator();

if (firebase.apps.length === 0) {
  firebase.initializeApp(firekey);
}

const db = firebase.firestore();
// const firesRef = db.collection("fires");
const testRef = db.collection("test").doc("1");

export default class Map extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      fires: [],
      airQuality: {},
      location: null,
      errorMessage: null,
      region: {
        latitude: 34.127850,
        longitude: -118.300501,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      permissionGranted: false,
      locationEntered: false
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
        let region = {
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 1,
          longitudeDelta: 1,
        }
        this.setState(
          {
            region: region,
            permissionGranted: true
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
        `https://api.breezometer.com/fires/v1/current-conditions?lat=${this.state.region.latitude}&lon=${this.state.region.longitude}&key=${breezy_key}&units=imperial&radius=62`
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
            `https://api.breezometer.com/air-quality/v2/current-conditions?lat=${this.state.region.latitude}&lon=${this.state.region.longitude}&key=${breezy_key}&features=local_aqi`
          )
          .then((results) => {
            // console.log("airQuality: ", results.data.data.indexes);
            if (this._isMounted) {
              this.setState({
                airQuality: results.data.data.indexes.usa_epa,
              });
            }
          });
      })
      .then(() => {
        this.setState({
          locationEntered: true
        })
      })
      .catch((err) => {
        console.error('is it this one? querybreezy', err);
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
        // console.log('location', this.state.location);
        // console.log('results: ', results.results)
        let region = {
          latitude: results.data.results[0].geometry.location.lat,
          longitude: results.data.results[0].geometry.location.lng,
          latitudeDelta: 1,
          longitudeDelta: 1,
        }
        this.setState({
          region: region,
        })
      })
      .then(() => this.queryBreezy())
      .catch((error) => console.error('getcitycoords', error))
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
    // this.props.navigation.navigate("DetailView")
    console.log('hey!')
  }

  getInitialState() {
    return {
      region: {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
    };
  }

  onRegionChange(region) {
    this.setState({ region });
  }

  render() {
    if (!this.state.permissionGranted && !this.state.locationEntered) {
      return (
        <Container>
          <Header searchBar rounded style={{ backgroundColor: "transparent" }}>
            <Item>
              <Icon name="search" />
              <Input placeholder="Enter Location" onChangeText={(text) => {
                this.changeHandler(text);
              }} onSubmitEditing={() => this.getCityCoords()} />
            </Item>
          </Header>
          <MapView
            style={styles.container}
            initialRegion={this.state.region}
            region={this.state.region}
          ></MapView>
        </Container>
      )

    } else {
      return (
        <Container>
          <Header searchBar rounded style={{ backgroundColor: "transparent" }}>
            <Item>
              <Icon name="search" />
              <Input placeholder="Enter Location" onChangeText={(text) => {
                this.changeHandler(text);
              }} onSubmitEditing={() => this.getCityCoords()} />
            </Item>
          </Header>
          <MapView
            style={styles.container}
            initialRegion={this.state.region}
            // initialRegion={{
            //   region: this.state.region
            // }}
            region={this.state.region}
          >
            {this.state.fires.map((fire, index) => {
              if (fire.details && fire.details.size.value > 5) {
                return (
                  <Marker
                    key={index}
                    image={require("../assets/clip1.png")}
                    coordinate={{
                      latitude: fire.position.lat,
                      longitude: fire.position.lon,
                    }}
                    onCalloutPress={() => this.calloutPress()}
                  >
                    {/* <Image source={require("../assets/clip1.png")} style={{ "height": .0005 * fire.details.size.value, "width": .0005 * fire.details.size.value }} /> */}
                    <Callout
                    // style={styles.calloutPopup}
                    >
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

                )
              }
            })
            }
            < Marker
              coordinate={{ latitude: this.state.region.latitude, longitude: this.state.region.longitude }}
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
            </Marker >
          </MapView >
        </Container>
      );
    }
  }
}

  const styles = StyleSheet.create({
    container: {
      //display: "flex",
      flex: 1,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 23,
      //height: "100%"
    },

    mapView: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      justifyContent: "center",
    },

    mapStyle: {
      display: "flex",
      flex: 5,
      backgroundColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 23,
      height: "100%"
    },

    searchBarStyle: {
      display: "flex",
      flex: 1
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
    calloutPopup: {
      height: "auto",
      width: 100
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
