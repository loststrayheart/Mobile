import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const Select = ({ navigation }) => {
  const [selectedValue, setSelectedValue] = useState("nextclass");

  const handleEnter = () => {
    if(selectedValue == "nextclass"){
        navigation.navigate("NextClass")
    }
    else if(selectedValue == "upcoming"){
        navigation.navigate("Upcoming")
    }
    else if(selectedValue == "activities"){
        navigation.navigate("Add")
    }
    else{
        navigation.navigate("Activity_Add")
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>กรุณาเลือกรายการ:</Text>
      
      {/* Picker Section */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={(itemValue) => setSelectedValue(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Next Class" value="nextclass" />
          <Picker.Item label="Upcoming" value="upcoming" />
          <Picker.Item label="Activities" value="activities" />
          <Picker.Item label="Study Plan" value="studyplan" />
        </Picker>
      </View>

      {/* Enter Button */}
      <TouchableOpacity style={styles.button} onPress={handleEnter}>
        <Text style={styles.buttonText}>Enter</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    overflow: 'hidden', // ทำให้ขอบมนแสดงผลถูกต้องบน iOS
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Select;