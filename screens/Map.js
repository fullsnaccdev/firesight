import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MapView, { Marker, Callout } from "react-native-maps";
// import { SearchBar } from 'react-native-elements';
import moment from "moment";
import { Header, Footer, Container, Icon, Item, Input } from "native-base";
import { LinearGradient } from 'expo-linear-gradient';

import { Constants } from "expo";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";
import * as firebase from "firebase";
import "firebase/firestore";
import firekey from "../firekey2.js";
import axios from "axios";
import breezy_key from "../breezy_key.js";
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
        latitude: 34.12785,
        longitude: -118.300501,
        latitudeDelta: 1,
        longitudeDelta: 1,
      },
      permissionGranted: false,
      locationEntered: false,
      timeStamp: "",
      isExpanded: true, // change to false if you want to dynamically change the size of callout
      currentRegion: "",
      currentCity: "",
    };
    // this.getData = this.getData.bind(this);
    this.queryBreezy = this.queryBreezy.bind(this);
    this.getCityCoords = this.getCityCoords.bind(this);
    this.calloutPress = this.calloutPress.bind(this);
  }
  componentDidMount() {
    this._isMounted = true;
    this.findCurrentLocation();
    // this.getData();
  }

  // updateData() {
  //   setInterval(this.queryBreezy, 10000)
  // }

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
        };
        this.setState(
          {
            region: region,
            permissionGranted: true,
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
            if (this._isMounted) {
              this.setState({
                airQuality: results.data.data.indexes.usa_epa,
              });
            }
          });
      })
      .then(() => {
        this.setState({ currentCity: this.state.location });
      })
      .then(() => {
        this.setState({
          locationEntered: true,
          timeStamp: moment().calendar(),
          location: "",
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
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${this.state.location}&key=${google_key}`
      )
      .then((results) => {
        let region = {
          latitude: results.data.results[0].geometry.location.lat,
          longitude: results.data.results[0].geometry.location.lng,
          latitudeDelta: 1,
          longitudeDelta: 1,
        };
        this.setState({
          region: region,
        });
      })
      .then(() => this.queryBreezy())
      .catch((err) => console.error(err));
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  changeHandler(text) {
    this.setState({
      location: text,
      // currentCity: text,
    });
  }

  calloutPress(coordinates) {
    // e.preventDefault();
    let currentRegion = {
      latitude: coordinates.lat,
      longitude: coordinates.lon,
      latitudeDelta: 1,
      longitudeDelta: 1,
    };
    this.setState({
      isExpanded: !this.state.isExpanded,
      currentRegion: currentRegion,
    });
  }

  closeExpansion() {
    this.setState({
      isExpanded: false,
    });
  }

  render() {
    if (!this.state.permissionGranted && !this.state.locationEntered) {
      return (
        <Container>
          <Header searchBar rounded style={styles.headerStyle}>
            <Item>
              <Icon name="search" />
              <Input
                placeholder="Enter Location"
                onChangeText={(text) => {
                  this.changeHandler(text);
                }}
                onSubmitEditing={() => this.getCityCoords()}
                clearButtonMode="always"
                value={this.state.location}
              />
            </Item>
          </Header>
          <MapView
            onPress={() => {
              Keyboard.dismiss();
            }}
            style={styles.container}
            initialRegion={this.state.region}
            region={this.state.region}
          ></MapView>
          <Footer style={styles.footerStyle}>
            <Text style={{ color: "white" }}>
            </Text>
          </Footer>
        </Container>
      );
    } else {
      return (
        <Container>
          <Header searchBar rounded style={styles.headerStyle}>
            <Item>
              <Icon name="search" />
              <Input
                placeholder="Enter Location"
                onChangeText={(text) => {
                  this.changeHandler(text);
                }}
                value={this.state.location}
                onSubmitEditing={() => this.getCityCoords()}
                clearButtonMode="always"
              />
            </Item>
          </Header>
          <MapView
            style={styles.container}
            initialRegion={this.state.region}
            region={
              this.state.currentRegion === ""
                ? this.state.region
                : this.state.currentRegion
            }
            onPress={() => {
              Keyboard.dismiss();
              // this.closeExpansion(); //turn this back on if you want the callout to be collapsed upon leaving
            }}
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
                    style={{ backgroundColor: "transparent" }}
                  // onCalloutPress={() => this.calloutPress(fire.position)} //turn this back on to make the callout expand
                  >
                    <Callout
                      style={
                        this.state.isExpanded
                          ? styles.calloutPopupExpanded
                          : styles.calloutPopup
                      }
                    // what does this do
                    >
                      {/* <View */}
                      {/* style={this.state.isExpanded ? styles.viewStyle : null} */}
                      {/* > */}
                      <Text style={styles.calloutTitle}>
                        {fire.details !== null &&
                          fire.details.fire_name !== null
                          ? fire.details.fire_name
                          : null}
                      </Text>
                      <Text style={styles.calloutDescription}>
                        {fire.details !== null &&
                          fire.details.percent_contained !== null
                          ? `${fire.details.percent_contained}% contained`
                          : "Containment % Unknown"}
                      </Text>
                      <Text style={styles.calloutDescription}>
                        {fire.details !== null &&
                          fire.details.size.value !== null
                          ? `${fire.details.size.value} acres`
                          : null}
                      </Text>
                      <Text style={styles.calloutDescription}>
                        Status: {fire.details.status}
                      </Text>
                      <Text style={styles.calloutDescription}>
                        Started:{" "}
                        {moment(fire.details.time_discovered).format(
                          "MMM Do YYYY"
                        )}
                      </Text>
                      <Text style={styles.calloutDescription}>
                        Type: {fire.details.fire_type}
                      </Text>
                      <Text style={styles.calloutDescription}>
                        {fire.position.distance.value} miles away from
                        {this.state.currentCity === "" ||
                          this.state.currentCity === null
                          ? " you"
                          : " " + this.state.currentCity}
                      </Text>

                      {/* </View> */}
                    </Callout>
                  </Marker>
                );
              }
            })}
            <Marker
              coordinate={{
                latitude: this.state.region.latitude,
                longitude: this.state.region.longitude,
              }}
            // title={"Air Quality"}
            // onCalloutPress={(e) => this.calloutPress()}
            // description={`${this.state.airQuality.category} : ${this.state.airQuality.aqi}`}
            >
              <Callout>
                <View>
                  <Text style={styles.calloutTitle}>{"Air Quality"}</Text>
                  <Text
                    style={styles.calloutDescription}
                  >{`AQI: ${this.state.airQuality.aqi}\n${this.state.airQuality.category}`}</Text>
                </View>
              </Callout>
            </Marker>
          </MapView>
          <Footer style={styles.footerStyle}>
            <Text style={{ color: "white" }}>
              Updated {this.state.timeStamp}
            </Text>
          </Footer>
        </Container>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    //display: "flex",
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 23,
    //height: "100%"
    position: "relative",
  },

  footerStyle: {
    height: 20,
    position: "absolute",
    zIndex: 100,
    backgroundColor: "#FFA03C",
  },

  headerStyle: {
    backgroundColor: '#FAFCFF',
    // height: 40,
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
    height: "100%",
  },
  viewStyle: {
    height: 180,
    width: 180,
  },

  searchBarStyle: {
    display: "flex",
    flex: 1,
  },

  input: {
    margin: 15,
    height: 40,
    borderColor: "#7a42f4",
    borderWidth: 1,
    padding: 10,
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
    flex: -1,
    position: "relative",
    // height: 180,
    // width: 180,
  },
  calloutPopupExpanded: {
    flex: -1,
    position: "relative",
    height: "100%",
    width: "100%",
    backgroundColor: "white",
    // opacity: 0.1,
    // borderColor: "black",""
    // borderWidth: 2,
    borderRadius: 15,
    padding: 7,
    margin: 0,
  },
  calloutTitle: {
    fontSize: 17,
    marginBottom: 5,
    fontWeight: "bold",
    textAlign: "center",
    padding: 5,
    backgroundColor: "#FFA03C",
    // borderRadius: 60,
    width: "100%"


  },
  calloutDescription: {
    fontSize: 14,
    paddingBottom: 2.46
  },
});
