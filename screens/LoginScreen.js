import React, { Component } from 'react';
import { StyleSheet, Text, View, Fonts, TouchableOpacity, SafeAreaView, Image } from "react-native";
import * as Google from 'expo-google-app-auth';
import iosClientId from '../iosClientId.js';
import * as firebase from "firebase";
import { Container, Content, Header, Form, Input, Item, Button, Label, StyleProvider } from 'native-base';
import firebaseConfig from '../firekey2.js';



class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstTimeUser: false,
      signUpFirstName: '',
      signUpLastName: '',
      signUpEmail: '',
      signUpPassword: '',
      loginEmail: '',
      loginPassword: '',
    }
  }

  signUpUser = (email, password) => {
    try {
      if (this.state.signUpPassword.length < 6) {
        alert("Please enter at least 6 characters")
        return;
      }
      firebase.auth().createUserWithEmailAndPassword(email, password)
    }

    catch(error) {
      console.log(error.toString());
    }
  }

  loginUser = (loginEmail, loginPassword) => {

  }

  isSigningUp() {
    this.setState({
      firstTimeUser: !this.state.firstTimeUser
    })
  }

  isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  }

  onSignIn = (googleUser) => {
    console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(function (firebaseUser) {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!this.isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        var credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.idToken,
          googleUser.accessToken);
        // Sign in with credential from the Google user.
        firebase.auth().signInWithCredential(credential).then((result) => {
          console.log("User already signed-in");
          if (result.additionalUserInfo.isNewUser) {

            firebase.database().ref('/users/' + result.user.uid)
              .set({
                gmail: result.user.email,
                location: result.additionalUserInfo.profile.locale,
                first_name: result.additionalUserInfo.profile.given_name,
                last_name: result.additionalUserInfo.profile.family_name,
                created_at: Date.now()
              })
          } else {
            firebase.database().ref('/users/' + result.user.uid).update({
              last_logged_in: Date.now()
            })
          }
        }).catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        })
      } else {
        console.log('User already signed-in Firebase.');
      }
    }.bind(this));
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
        this.onSignIn(result)
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
    console.log(this.state)
    if (this.state.firstTimeUser) {
      return (
        <Container style={styles.container}>
          <Form>
            <Item floatingLabel>
              <Label>First Name</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={(signUpFirstName) => {
                  this.setState({signUpFirstName});
                }}
              />
            </Item>
            <Item floatingLabel>
              <Label>Last Name</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={(signUpLastName) => {
                  this.setState({signUpLastName});
                }}
              />
            </Item>
            <Item floatingLabel>
              <Label>Email</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={(signUpEmail) => {
                  this.setState({signUpEmail});
                }}
              />
            </Item>
            <Item floatingLabel>
              <Label>Password</Label>
              <Input
                secureTextEntry={true}
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={(signUpPassword) => {
                  this.setState({signUpPassword});
                }}
              />
            </Item>
            <Button style={{ marginTop: 10 }}
              full
              rounded
              success
              onPress={() => this.signUpUser(this.state.signUpEmail, this.state.signUpPassword)}
            >
              <Text>Sign Up</Text>
            </Button>
          </Form>
        </Container>
      )
    } else {
      return (
        <Container style={styles.container}>
          <Form>
            <Item floatingLabel>
              <Label>Email</Label>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={(loginEmail) => {
                  this.setState({loginEmail});
                }}
              />
            </Item>
            <Item floatingLabel>
              <Label>Password</Label>
              <Input
                secureTextEntry={true}
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={(loginPassword) => {
                  this.setState({loginPassword});
                }}
              />
            </Item>
            <Button style={{ marginTop: 10 }}
              full
              bordered
              success
              onPress = { () => this.loginUser(this.state.loginEmail, this.state.loginPassword)}
            >
              <Text>Login</Text>
            </Button>
          </Form>
          <Button
            onPress={() => { this.signInWithGoogleAsync() }}
            full
            bordered
            success
          >
            <Text style={{padding: 10, alignSelf: 'center'}}>Login with Google</Text>
          </Button>
          {/* <StyleProvider style={customTheme}>
            <Button customStyleProp onPress={() => { this.signInWithGoogleAsync() }} >
              <Text>Login with Google</Text>
            </Button>
          </StyleProvider> */}
          <TouchableOpacity
            onPress={() => { this.isSigningUp() }}
          >
            <Text style={{padding: 10, alignSelf: 'center' }}>
              Sign Up
            </Text>
          </TouchableOpacity>

        </Container>
      );
    }
  }
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
  },
})

// const customTheme = {
//   'NativeBase.Button': {
//     .customStyleProp: {
//       height: 35,
//       borderRadius: 35,
//       padding: 10,
//       alignSelf: center,
//     },
//   }