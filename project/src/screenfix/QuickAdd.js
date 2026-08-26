import React from 'react'
import { View, Text, StyleSheet, Alert, TouchableOpacity} from 'react-native'
import { TextInput } from 'react-native/types_generated/index'

const QuickAdd = () => {
    return (
        <View style = {styles.container}>
            <View style = {styles.card}>
                <Text style = {styles.text}>Quick Add</Text>
                <TextInput>
                    
                </TextInput>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    card:{
        backgroundColor: 'white',
        width: '100%',
        height: '50',
    },
    text:{
        fontSize: 18,
        fontWeight: 'bold'
    }
})

export default QuickAdd