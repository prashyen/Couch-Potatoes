import * as React from "react";
import { Text, Image, StyleSheet } from "react-native";
import { Toast, Container, Spinner, Label, Button, Input, Form, Item, Content } from 'native-base';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ScrollView } from "react-native-gesture-handler";
import { useState } from "react";
import api from '../api'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  let getCSRF = function (cookie) {
    return cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  }

  let getUsername = function (cookie) {
    return cookie.replace(/(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  }

  let submit = function () {
    setLoading(true);
    if (username.trim() === '' || pass.trim() === '') {
      setLoading(false);
      return (Toast.show({
        text: "Fill in all fields",
        textStyle: { color: "yellow" },
        duration: 7000,
        onclose: 'user'
      }));
    } else {
      api().getCSRFToken(function (res) {
        var csrf = getCSRF(res.res.headers.get('set-cookie'));
        api(csrf).login({ username: username, password: pass }, function (response) {
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
            setUsername('');
            setPass('')
            AsyncStorage.setItem('username', getUsername(response.res.headers.get('set-cookie')), function (res, err) {
              AsyncStorage.setItem('csrf', csrf)
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
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
      alignSelf: 'center', borderWidth: 3, borderColor: "#b2b2b7", borderRadius: 100, padding: 10
    },
    container: {
      backgroundColor: '#231F20', justifyContent: 'center', flex: 1
    },
    title: {
      fontFamily: 'serif',
      fontSize: 20,
      textAlign: 'center',
      padding: 5,
      marginTop: 20
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
    signupBtn: {
      marginTop: 10,
      margin: 15,
      backgroundColor: "#b2b2b7",
      color: '#231F20',
      borderRadius: 5
    },
    btnText: {
      color: '#231F20'
    },
    label: {
      color: "#fff"
    },
    textLink: {
      color: 'blue',
      textDecorationLine: 'underline',
      alignSelf: 'center'
    }
  });

  return (
    <SafeAreaProvider>
      <Container>
        <Content contentContainerStyle={styles.container}>
          {loading ?
            <Spinner color="#fff" /> :
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
              <Image style={styles.logo} source={require('../media/potato512.png')} />
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
                  <Label style={styles.label}>Password</Label>
                  <Input
                    secureTextEntry={true}
                    style={styles.input}
                    value={pass}
                    onChangeText={setPass}
                    textContentType={'password'}
                  />
                </Item>
                <Button full style={styles.loginBtn} onPress={submit}>
                  <Text style={styles.btnText}>LOGIN</Text>
                </Button>
                <Button onPress={() => navigation.push('Signup')} full style={styles.signupBtn}>
                  <Text style={styles.btnText}>No Account? Sign Up</Text>
                </Button>
              </Form>
              <Text style={styles.textLink} onPress={() => navigation.navigate("CreditsScreen")}>
                Credits
              </Text>
            </ScrollView>
          }
        </Content>
      </Container>
    </SafeAreaProvider>
  );
}
