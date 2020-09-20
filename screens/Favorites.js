import React, { Component } from 'react';
import { StyleSheet, Text, View, Fonts, TouchableOpacity, SafeAreaView, Image } from "react-native";
import * as Google from 'expo-google-app-auth';
import iosClientId from '../iosClientId.js';
import * as firebase from "firebase";
import { Container, Content, Header, Form, Input, Item, Button, Label, StyleProvider } from 'native-base';
import firebaseConfig from '../firekey2.js';
import { LinearGradient } from 'expo-linear-gradient';
import { render } from 'react-dom';


class Favorites extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
    
        };

    }

    render() {
        return(
            <Container>
                
            </Container>
        )
    }
}

export default Favorites;