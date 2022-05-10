import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, FlatList, TextInput } from 'react-native';
import { NavigationContainer } from'@react-navigation/native';
import { createNativeStackNavigator } from'@react-navigation/native-stack';
import * as SQLite from 'expo-sqlite';

const Stack = createNativeStackNavigator();
const db = SQLite.openDatabase('coursedb.db');

export default function App() {
  return (
       <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Training" component={Training} />
            <Stack.Screen name="New Training" component={NewTraining} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Running" component={Running} />
          </Stack.Navigator>
      </NavigationContainer>
  );
}

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex:1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 50 }}>Training app</Text>
      <Button
      title="Training"
      onPress={() => navigation.navigate('Training')}
      />
      <Button
      title="Settings"
      onPress={() => navigation.navigate('Settings')}
      />
      <StatusBar style="auto" />
      </View>
  );
}

function Training({ navigation }) {

  return (
    <View style={styles.container}>
      <Text>Choose your training</Text>
      <Button title="Muscle Training"
      onPress={() => navigation.navigate('New Training')}
       />
      <Button title="Running"
      onPress={() => navigation.navigate('Running')}
      />
    </View>
  );
}

function Settings() {
  return (
    <View style={styles.container}>
      <Text>Coming soon</Text>
    </View>
  )
}

function Running() {
  const [run, setRun] = useState('');
  const [time, setTime] = useState('');
  const [jog, setJog] = useState([]);

  const jogging = () => {
    const entry = run + " " + time;
    setJog ([...jog, { key: entry}]);
  }
  return (
    <View style={styles.container}>
      <TextInput
        placeholder='Distance'
        style={{ width: 200, borderColor: "gray", borderWidth: 1 }}
        onChangeText={(text) => setRun(text)}
        value={run}
       />
      <TextInput
        placeholder='Time'
        style={{ width: 200, borderColor: "gray", borderWidth: 1 }}
        onChangeText={(text) => setTime(text)}
        value={time}
       />
       <Button onPress={jogging} title="Add new run" />
      <Text>Past runs</Text>
      <FlatList
        data={jog}
        renderItem={({ item }) => <Text>{item.key}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  )
}

function NewTraining() {
  const [move, setMove] = useState(''); 
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [pastTraining, setPastTraining] = useState([]);

  // TALLENNUS EI TOIMINUT KUN LISÄSIN "REPS". AJATTELIN ONKO VIKA SQL LAUSEISSA VAI FLAT LISTISSÄ

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql('create table if not exists pastTraining (id integer primary key not null, move text, weight text, reps text);');
    }, null, updateList); 
  }, []);

  const saveTraining = () => {
    db.transaction(tx => {
        tx.executeSql('insert into pastTraining (move, weight, reps) values (?, ?, ?);', [move, weight, reps]);    
      }, null, updateList
    )
  }

  const updateList = () => {
    db.transaction(tx => {
      tx.executeSql('select * from pastTraining;', [], (_, { rows }) =>
        setPastTraining(rows._array)
      ); 
    });
  }

  const deleteTraining = (id) => {
    db.transaction(
      tx => {
        tx.executeSql(`delete from pastTraining where id = ?;`, [id]);
      }, null, updateList
    )    
  }

  const listSeparator = () => {
    return (
      <View
        style={{
          height: 5,
          width: "80%",
          backgroundColor: "#fff",
          marginLeft: "10%"
        }}
      />
    );
  };

  // VIRHE VOISI MYÖS OLLA FLATLISTIN RENDER ITEMISSA TAI SITTEN VOI OLLA JOKIN TOINENKIN VIRHE

  return (
    <View style={styles.container}>
      <TextInput placeholder='Move' style={{marginTop: 30, fontSize: 18, width: 200, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(move) => setMove(move)}
        value={move}/>  
      <TextInput placeholder='Weight' style={{ marginTop: 5, marginBottom: 5,  fontSize:18, width: 200, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(weight) => setWeight(weight)}
        value={weight}/> 
      <TextInput placeholder='Reps' style={{ marginTop: 5, marginBottom: 5,  fontSize:18, width: 200, borderColor: 'gray', borderWidth: 1}}
        onChangeText={(reps) => setReps(reps)}
        value={reps}/>           
      <Button onPress={saveTraining} title="Save" /> 
      <Text style={{marginTop: 30, fontSize: 20}}>Past trainings</Text>
      <FlatList 
        style={{marginLeft : "5%"}}
        keyExtractor={item => item.id.toString()} 
        renderItem={({item}) => <View style={styles.listcontainer}><Text style={{fontSize: 18}}>{item.move}, {item.weight}, {item.reps}</Text>
        <Text style={{fontSize: 18, color: '#0000ff'}} onPress={() => deleteTraining(item.id)}> Delete</Text></View>} 
        data={pastTraining} 
        ItemSeparatorComponent={listSeparator} 
      />      
    </View>
  );
}

const styles = StyleSheet.create({
 container: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'center',
 },
 listcontainer: {
  flexDirection: 'row',
  backgroundColor: '#fff',
  alignItems: 'center'
 },
});
