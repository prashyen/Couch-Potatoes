import * as React from "react";
import { Text, StyleSheet } from "react-native";
import { Thumbnail, Toast, Container, Icon, Label, Button, Input, Form, Item, Content, Spinner } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from "react";
import api from '../api'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from "react-native-gesture-handler";
import EmailValidator from 'email-validator';
import * as ImagePicker from 'expo-image-picker';
import mime from "mime";

export default function SignupScreen({ navigation }) {

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [pass, setPass] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cPass, setCPass] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);

  let getCSRF = function (cookie) {
    return cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  }
  let getUsername = function (cookie) {
    return cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  }

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  let submit = function (e) {
    setLoading(true);
    if (username.trim() === '' || cPass.trim() === '' || email.trim() === ''
      || firstName.trim() === '' || lastName.trim() === '' || pass.trim() === '') {
      setLoading(false);
      return (Toast.show({
        text: "Fill in all fields",
        textStyle: { color: "yellow" },
        duration: 7000,
        onclose: 'user'
      }));
    } else if (!EmailValidator.validate(email)) {
      setLoading(false);
      return (Toast.show({
        text: "Invalid Email",
        textStyle: { color: "yellow" },
        duration: 7000,
        onclose: 'user'
      }));
    } else if (pass.length < 8) {
      setLoading(false);
      return (Toast.show({
        text: "Password must be min 8 Characters",
        textStyle: { color: "yellow" },
        duration: 7000,
        onclose: 'user'
      }));
    } else if (cPass != pass) {
      setLoading(false);
      return (Toast.show({
        text: "Passwords don't match",
        textStyle: { color: "yellow" },
        duration: 7000,
        onclose: 'user'
      }));
    } else {
      api().getCSRFToken(function (res) {
        let csrf = getCSRF(res.res.headers.get('set-cookie'))
        var data = new FormData();
        data.append('username', username)
        data.append('password', pass)
        data.append('first_name', firstName)
        data.append('last_name', lastName)
        data.append('email', email)
        if (profilePhoto !== null) {
          data.append('file', {
            type: mime.getType(profilePhoto.uri),
            uri: profilePhoto.uri,
            name: profilePhoto.uri.replace(/^.*[\\\/]/, '')
          })
        }
        api(csrf).signup(data,
          function (response) {
            if (response.res.status !== 201) {
              setLoading(false);
              Toast.show({
                text: response.data,
                textStyle: { color: "red" },
                duration: 7000,
                onclose: 'user'
              })
            }
            else {
              setCPass('');
              setEmail('');
              setFirstName('');
              setLastName('');
              setUsername('');
              setPass('');
              AsyncStorage.setItem('username', getUsername(response.res.headers.get('set-cookie')), function (res, err) {
                if (err) {
                  Toast.show({
                    text: "Signup failed",
                    textStyle: { color: "red" },
                    duration: 7000,
                    onclose: 'user'
                  })
                } else {
                  AsyncStorage.setItem('csrf', csrf)
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                  });
                }
              })
            }
          })
      });
    }
  }
  const styles = StyleSheet.create({
    header: {
      backgroundColor: '#231F20'
    },
    logo: {
      alignSelf: 'center',
      borderWidth: 3,
      borderColor: "#b2b2b7",
      borderRadius: 100,
      padding: 10
    },
    title: {
      fontFamily: 'serif',
      fontSize: 20,
      textAlign: 'center',
      padding: 5
    },
    input: {
      marginBottom: 5,
      marginTop: 5,
      color: "#fff"
    },
    loginBtn: {
      marginTop: 40,
      margin: 15,
      backgroundColor: "#b2b2b7",
      color: '#231F20',
      borderRadius: 5
    },
    photoBtn: {
      // marginTop: 20,
      // margin: 15,
      width: 180,
      marginBottom: 0,
      backgroundColor: "#b2b2b7",
      color: '#231F20',
      alignSelf: 'center',
      borderRadius: 5
    },
    signupBtn: {
      marginTop: 10,
      margin: 15,
      backgroundColor: "#b2b2b7",
      color: '#231F20',
      borderRadius: 5
    },
    btnText: {
      color: '#ffffff'
    },
    btnText: {
      color: '#231F20'
    },
    label: {
      color: "#fff"
    },
    container: {
      backgroundColor: '#231F20',
      justifyContent: 'center',
      flex: 1
    },
    defaultIcon: {
      marginTop: 40,
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'center',
      fontSize: 180,
      color: 'white'
    },
    thumbnail: {
      flex: 1,
      alignSelf: 'center',
      justifyContent: 'center',
      marginTop: 30
    }
  });

  handleChoosePhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 2]
    });
    if (!result.cancelled) {
      setProfilePhoto(result);
    }
  };

  return (
    <SafeAreaProvider>
      <Container>
        <Content contentContainerStyle={styles.container}>
          {loading ?
            <Spinner color="#fff" /> :
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
              {profilePhoto ?

                <Thumbnail style={styles.thumbnail} source={{ uri: profilePhoto.uri }} large />
                :
                <Icon style={styles.defaultIcon} name="person-circle-outline"></Icon>
              }
              <Button full style={styles.photoBtn} onPress={handleChoosePhoto}>
                <Text style={styles.btnText}>Choose Profile Picture</Text>
              </Button>
              <Form>
                <Item floatingLabel>
                  <Label style={styles.label}>Username</Label>
                  <Input
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    textContentType={'username'}
                  />
                </Item>
                <Item floatingLabel>
                  <Label style={styles.label}>First Name</Label>
                  <Input
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </Item>
                <Item floatingLabel>
                  <Label style={styles.label}>Last Name</Label>
                  <Input
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </Item>
                <Item floatingLabel>
                  <Label style={styles.label}>Email</Label>
                  <Input
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    textContentType={"emailAddress"}
                  />
                </Item>
                <Item floatingLabel>
                  <Label style={styles.label}>Password: Min 8 Characters</Label>
                  <Input
                    textContentType={'newPassword'}
                    secureTextEntry={true}
                    style={styles.input}
                    value={pass}
                    onChangeText={setPass}
                  />
                </Item>
                <Item floatingLabel>
                  <Label style={styles.label}>Confirm Password</Label>
                  <Input
                    textContentType={'newPassword'}
                    secureTextEntry={true}
                    style={styles.input}
                    value={cPass}
                    onChangeText={setCPass}
                  />
                </Item>
                <Button full style={styles.loginBtn}
                  onPress={submit}>
                  <Text style={styles.btnText}>SIGNUP</Text>
                </Button>
                <Button full style={styles.signupBtn}
                  onPress={() => navigation.push('Login')}>
                  <Text style={styles.btnText}>Already have an account? Login</Text>
                </Button>
              </Form>
            </ScrollView>
          }

        </Content>
      </Container>
    </SafeAreaProvider>
  );
}
