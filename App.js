import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PlacesList, {ShowOnMap, ShowSavedOnMap} from './components/PlacesList';

import { Input, Button, Text } from 'react-native-elements';

const Stack = createStackNavigator();

export default function App() {


  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="List" component={PlacesList} />
          <Stack.Screen name="ShowOnMap" component={ShowOnMap} />
          <Stack.Screen name="ShowSavedOnMap" component={ShowSavedOnMap} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}
