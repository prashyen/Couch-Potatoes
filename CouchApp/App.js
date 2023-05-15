import * as React from "react";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import { useEffect } from "react";
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import HomeScreen from './screens/HomeScreen'
import ShowScreen from "./screens/ShowScreen"
import UserProfileScreen from "./screens/UserProfileScreen";
import { Root } from "native-base";
import CreditsScreen from "./screens/CreditsScreen";

export default function App() {
  const Stack = createStackNavigator();
  useEffect(() => {
    (async () => await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
    }))();
  }, [])
  return (
    <SafeAreaProvider>
      <Root>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ShowScreen" component={ShowScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="CreditsScreen" component={CreditsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </Root>
    </SafeAreaProvider>
  );
}
