import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { AvailableShapes } from "@u/shapes";

const SelectShape = ({color = 'black', value, onValueChanged}) => {
    const [currentValue, setCurrentValue] = useState(value)

    const handleShapeClick = (shape) => {
        setCurrentValue(shape);
        onValueChanged(shape);
    };

    return (
        <View style={styles.container}>
            {AvailableShapes.map((shape, index) => (
                <TouchableOpacity key={index} style={styles.item} onPress={() => handleShapeClick(shape)}>
                    <Text style={{ color: currentValue === shape ? color : 'grey' }}>{shape}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 250,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    item: {
        width: '33.33%',
        padding: 10,
        alignItems: 'center',
    },
});

export default SelectShape