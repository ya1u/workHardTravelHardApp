import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto } from '@expo/vector-icons';
import { theme } from './color';

const STORAGE_KEY = "@toDos";
const STORAGE_WORKING = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState();
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
  }, []);

  const travel = async () => {
    await saveWorking(false);
    setWorking(false)
  };
  const work = async () => {
    await saveWorking(true);
    setWorking(true);
  };
  const onChangeText = (payload) => setText(payload);
  const saveWorking = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_WORKING, JSON.stringify(toSave));
  }
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  };
  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    const w = await AsyncStorage.getItem(STORAGE_WORKING);
    if (s && w) {
      setToDos(JSON.parse(s));
      setWorking(JSON.parse(w));
    }
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    setText("");
    // const newToDos = Object.assign({}, toDos, {[Date.now()]: {text, work:working }})
    const newToDos = { ...toDos, [Date.now()]: { text, work: working, isChecked: false } };
    await saveToDos(newToDos);
    setToDos(newToDos);
  };
  const updateIsChecked = async (key) => {
    const newToDos = { ...toDos };
    newToDos[key].isChecked = !newToDos[key].isChecked;
    saveToDos(newToDos);
    setToDos(newToDos);
  }
  const deleteToDo = async (key) => {
    if (Platform.OS === 'web') {
      const ok = confirm('정말로 삭제하시겠습니까?');
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        saveToDos(newToDos);
        setToDos(newToDos);
      }
    } else {
      Alert.alert("삭제하기", "정말로 삭제하시겠습니까?", [
        { text: "Cancel" },
        {
          text: "OK", style: "destructive", onPress: () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            saveToDos(newToDos);
            setToDos(newToDos);
          }
        }
      ]);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{ ...styles.btnText, color: working ? "white" : theme.grey }}>투두</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{ ...styles.btnText, color: !working ? "white" : theme.grey }}>투여행</ Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={working ? "무엇을 해야하나요?" : "어디로 가고싶나요?"}
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].work === working ? (
            <View key={key} style={styles.toDo}>
              <BouncyCheckbox
                isChecked={toDos[key].isChecked}
                size={18}
                fillColor="red"
                text={toDos[key].text}
                textStyle={toDos[key].isChecked ? "" : styles.toDoText}
                onPress={() => updateIsChecked(key)} />
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <Fontisto name='trash' size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: 600,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 30,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: 500,
  }
});
