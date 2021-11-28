import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Alert, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MapView, { Marker } from 'react-native-maps';

import * as SQLite from 'expo-sqlite';

import { Input, Button, ListItem } from 'react-native-elements';

//Setting up the doorhandle for the db
const db = SQLite.openDatabase('placesdb.db');

//Function for showing the requested address on map, gets the address as a prop
export function ShowOnMap({ navigation, route }) {

    let { input } = route.params

    const [region, setRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0221,
        city: '',
        name: '',
    });

    const [coordinate, setCoordinate] = useState({ latitude: region.latitude, longitude: region.longitude })

    useEffect(() => { getMap() }, []);
    useEffect(() => { setCoordinate({ latitude: region.latitude, longitude: region.longitude }) }, [region]);

    //Searches the map from the API
    const getMap = () => {

        let key = input.replace(/\s+/g, '');
        key = key.replace(/[0-9]/g, '')
        let number = input.replace(/[^0-9]/g, '');
        console.log(number)
        console.log(key)
        fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=QHllj8TueiNQZxPxioSLPTfbEATpyXpx&street=${number}+${key}`)
            .then(response => response.json())
            .then(responseJson => setRegion({
                latitude: responseJson.results[0].locations[0].displayLatLng.lat,
                longitude: responseJson.results[0].locations[0].displayLatLng.lng,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
                name: input,
            }),
            )
            .catch(error => {
                Alert.alert('error', error.message)
            });
    }

    //Save adress and map location to db
    const saveItem = () => {

        db.transaction(tx => {
            tx.executeSql('insert into placeslist (latitude, longitude, latitudeDelta, longitudeDelta, city, name ) values (?, ?, ?, ?, ?, ?);', [region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta, region.city, region.name]);
        }, null, () => navigation.navigate('List')
        );

    }

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={{ height: '90%' }}
                region={region}
            >
                <Marker
                    coordinate=
                    {coordinate}
                    title='Your spot' />
            </MapView>
            <Button title='SAVE LOCATION' onPress={saveItem} />
        </View>
    )
}

//Function shows allready saved map locations with a disabled "save"-button, gets the whole item as a aprop
export function ShowSavedOnMap({ navigation, route }) {

    let  {item}  = route.params

    const [region, setRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0422,
        longitudeDelta: 0.0221,
    });

    const [coordinate, setCoordinate] = useState({ latitude: region.latitude, longitude: region.longitude })

    useEffect(() => { getMap() }, []);
    useEffect(() => { setCoordinate({ latitude: region.latitude, longitude: region.longitude }) }, [region]);

    const getMap = () => {

        let key = item.name.replace(/\s+/g, '');
        fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=QHllj8TueiNQZxPxioSLPTfbEATpyXpx&location=${key}`)
            .then(response => response.json())
            .then(responseJson => setRegion({
                latitude: responseJson.results[0].locations[0].displayLatLng.lat,
                longitude: responseJson.results[0].locations[0].displayLatLng.lng,
                latitudeDelta: 0.0122,
                longitudeDelta: 0.0121,
            }),
            )
            .catch(error => {
                Alert.alert('error', error.message)
            });
    }

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={{ height: '90%' }}
                region={region}
            >
                <Marker
                    coordinate=
                    {coordinate}
                    title='Your spot' />
            </MapView>
            <Button title='SAVE LOCATION'
                disabled
                disabledStyle={{
                    borderWidth: 2,
                    borderColor: "#00F"
                }} />
        </View>
    )
}

//function to list and delete all the saved places, also to search for places
export default function PlacesList({ navigation }) {

    const [input, setInput] = useState('');
    const [data, setData] = useState([]);

    //creates the db
    useEffect(() => {
        db.transaction(tx => {
            tx.executeSql('create table if not exists placeslist (id integer primary key not null, latitude real, longitude real, latitudeDelta real, longitudeDelta real, name text );');
        });
        updateList();
        console.log(data)
        setInput('')
    }, []);

    //Updates the list, everytime the component is updated
    useEffect(() => {
        updateList();
    })



    //Deleting from the db
    const deleteItem = (id) => {
        db.transaction(
            tx => {
                tx.executeSql(`delete from placeslist where id = ?;`, [id]);
            }, null, updateList
        )
    }

    /*const clearItems = () => {
        db.transaction(
            tx => {
                tx.executeSql(`DELETE FROM placeslist;`);
            }, null, updateList
        )
    }*/

    //Updtaes the data from the db
    const updateList = () => {
        db.transaction(tx => {
            tx.executeSql('select * from placeslist;', [], (_, { rows }) =>
                setData(rows._array)
            );
        });
    }

    const renderItem = ({ item }) => (
        <ListItem 
            bottomDivider 
            topDivider
            onPress={() => navigation.navigate('ShowSavedOnMap', { item })}
            onLongPress={() => longPress(item.id)}
            >
            <ListItem.Content>
                <ListItem.Title>
                    {item.name}
                </ListItem.Title>
                <ListItem.Subtitle>Delete address </ListItem.Subtitle>
            </ListItem.Content>
        </ListItem>)

        const press = () => {
            navigation.navigate('ShowOnMap', { input });
            setInput('');
        }

        const longPress = (id) => {
            Alert.alert(
                'Do you want to delete this address?',
                'This address will be deleted permanently',
                [
                    {
                        text: "Cancel",
                    },
                    { text: "OK", onPress: () => deleteItem(id) }
                ]
            )
        }


    return (
        <View style={styles.container}>
            <Input label="PLACEFINDER" placeholder='Type in address, city' onChangeText={(input) => setInput(input)} value={input} />
            <Button title="SEARCH" onPress={press}/>
            {/*<Button title='CLEAR' onPress={clearItems} />*/}
            <FlatList
                style={{ width: '100%', padding: 10 }}
                data={data}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()} />
            <StatusBar
            hidden/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edfcf1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listitem: {
        justifyContent: 'space-between'
    }
});