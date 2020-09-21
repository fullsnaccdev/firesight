import React, { Component } from 'react';
import { StyleSheet, Text, View, Fonts, TouchableOpacity, SafeAreaView, Image } from "react-native";
import * as Google from 'expo-google-app-auth';
// import * as GoogleSignIn from 'expo-google-sign-in';
import iosClientId from '../iosClientId.js';
import * as firebase from "firebase";
import { Container, Content, Header, Form, Input, Item, Button, Label, StyleProvider } from 'native-base';
import firebaseConfig from '../firekey2.js';
import { LinearGradient } from 'expo-linear-gradient';

class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstTimeUser: false,
      loginEmail: '',
      loginPassword: '',
      currentUser: ''
    }
  }

  loginUser = (loginEmail, loginPassword) => {
    try {
      firebase.auth().signInWithEmailAndPassword(loginEmail, loginPassword)
        .then((result) => {
          console.log(result.user.uid)
          this.setState({
            currentUser: result.user.uid
          })
          return result.user.uid
        })
        .then(() => {
          this.setState({
            loginPassword: '',
            loginEmail: ''
          })
        })
        .then((uid) => {
          alert('Welcome back!')
          this.props.navigation.navigate('Map', {uid: uid})
        })
    }
    catch (error) {
      alert(error)
      console.log(error.toString())
    }
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
    return (
      <View style={styles.container}>
        <Form>
          <Item floatingLabel>
            <Label
              style={styles.buttonText}
            >Email</Label>
            <Input
              style={styles.inputBox}
              value={this.state.loginEmail}
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={(loginEmail) => {
                this.setState({ loginEmail });
              }}
            />
          </Item>
          <Item floatingLabel>
            <Label
              style={styles.buttonText}
            >Password</Label>
            <Input
              style={styles.inputBox}
              value={this.state.loginPassword}
              secureTextEntry={true}
              autoCorrect={false}
              autoCapitalize="none"
              onChangeText={(loginPassword) => {
                this.setState({ loginPassword });
              }}
            />
          </Item>
          <Button
            style={styles.button}
            full
            bordered
            success
            onPress={() => {this.loginUser(this.state.loginEmail, this.state.loginPassword)}}
          >
            <Text style={styles.buttonText}>
              Login
              </Text>
          </Button>
        </Form>
        <Button
          style={styles.googleButton}
          onPress={() => { this.signInWithGoogleAsync() }}
          full
          bordered
        >
          <Text
          style={styles.buttonText}
          >Login with Google</Text>
        </Button>
      </View>
    );
  }
}

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  inputBox: {
    width: '85%',
    margin: 10,
    padding: 15,
    fontSize: 16,
    // borderColor: '#581915',
    // borderBottomWidth: 1,
    textAlign: 'left'
  },
  googleButton: {
    marginTop: 50,
    // marginBottom: 5,
    // paddingVertical: 5,
    justifyContent: 'center',
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderColor: '#000000',
    // borderWidth: 1,
    borderRadius: 5,
    width: '70%'

  },
  button: {
    marginTop: 50,
    // marginBottom: 5,
    // paddingVertical: 5,
    justifyContent: 'center',
    textAlign: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFB236',
    borderColor: '#000000',
    // borderWidth: 1,
    borderRadius: 5,
    width: '70%'
  },
  buttonText: {
    fontSize: 20,
    // fontWeight: 'bold',
    color: '#581915',
    textAlign: 'center'
  },
  buttonSignup: {
    fontSize: 12,
  }
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