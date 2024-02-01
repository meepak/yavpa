import React, { useState, useEffect } from 'react';
import { View, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import ColorPicker from "@/components/color-box/color-picker";
import ColorHunter from "@/components/color-box/color-hunter";
import { ColorBoxProps } from "@/components/color-box/interface";
import { rgbToHsl, hslToRgb } from "@/utilities/color-conversion";



const ColorBox = ({ initialColor = '#000000', onColorSelected }: ColorBoxProps) => {
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [colorBuckets, setColorBuckets] = useState(new Array(5).fill('#FFFFFF'));

    useEffect(() => {
        setSelectedColor(initialColor);
    }, [initialColor]);

    const handleColorSelected = (color: string) => {
        // console.log('handle', color);
        if (color.startsWith('hsl')) {
            // hsl to rgb conversion
            color = hslToRgb(color)
        }
        setSelectedColor(color);
        if (onColorSelected) {
            onColorSelected(color);
        }
    };

    const addColorToBucket = () => {
        setColorBuckets([...colorBuckets, selectedColor]);
    };

    const selectColorFromBucket = (color: string) => {
        setSelectedColor(color);
        if (onColorSelected) {
            onColorSelected(color);
        }
    };

    return (
        <View style={{ width: 300, height: 190 }}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
                <View style={{ alignSelf: 'flex-start', width: 88, height: 140 }} >
                    <ColorHunter
                        initialColor={rgbToHsl(selectedColor)}
                        onColorSelected={handleColorSelected}
                    />
                </View>
                <View style={{ alignSelf: 'flex-start', width: 210 }}>
                    <ColorPicker
                        initialColor={selectedColor}
                        onColorSelected={handleColorSelected}
                    />
                </View>
            </View >
            <View style={styles.bucketContainer}>
                {colorBuckets.map((color, index) => (
                    <TouchableOpacity key={index} style={[styles.bucket, { backgroundColor: color }]} onPress={() => selectColorFromBucket(color)} />
                ))}

                {/* <TouchableOpacity
                    style={{
                        width: 32,
                        height: 32,
                        borderWidth: 2,
                        borderColor: "blue",
                        borderRadius: 16,
                        alignContent: "center",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onPress={addColorToBucket}
                >
                    <MaterialIcons name={'add'} size={24} color="blue" />

                </TouchableOpacity> */}

            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    bucketContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 40,
    },
    bucket: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
});

export default ColorBox;