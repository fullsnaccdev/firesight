import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, Fonts, TouchableOpacity, SafeAreaView, Image } from "react-native";
import * as Google from 'expo-google-app-auth';
import iosClientId from '../iosClientId.js';



class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
  }

  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        // androidClientId: YOUR_CLIENT_ID_HERE,

        behavior: 'web',
        iosClientId: iosClientId,
        scopes: ['profile', 'email'],
      });

      if (result.type === 'success') {
        this.props.navigation.navigate('Map')
        return result.accessToken;

      } else {
        return { cancelled: true };
      }
    } catch (e) {
      return { error: true };
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
        title="Sign In With Google"
        onPress={() => {this.signInWithGoogleAsync()}}
        />
      </View>
    );
  }
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
