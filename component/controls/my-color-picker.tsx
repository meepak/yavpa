import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';

const MyColorPicker = ({ initialColor = '#000000', onColorSelected }) => {
  const [inputColor, setInputColor] = useState(initialColor);

  const isValidHex = (text) => /^#([A-Fa-f0-9]{6})?$/.test(text);

  return (
    <View style={{ width: 280, top: -15 }}>
      <ColorPicker
        color={isValidHex(inputColor) ? inputColor : initialColor}
        swatchesOnly={false}
        onColorChange={() => { }}
        onColorChangeComplete={(color) => {
          setInputColor(color);
          if (isValidHex(color)) {
            onColorSelected(color);
          }
        }}
        thumbSize={30}
        sliderSize={30}
        gapSize={10}
        noSnap={true}
        row={false}
        swatchesLast={true}
        swatches={true}
        discrete={false}
        shadeWheelThumb={true}
        shadeSliderThumb={true}
        useNativeDriver={false}
        useNativeLayout={false}
      />
     <View style={styles.container}>
      <Text style={styles.hash}>#</Text>
      <TextInput 
        style={styles.input}
        onChangeText={(text) => {
          setInputColor('#' + text);
        }}
        onBlur={() => {
          if (!isValidHex(inputColor)) {
            setInputColor(initialColor);
          }
        }}
        selectTextOnFocus={true} 
        value={inputColor.substring(1)}  
      />
    </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
    height: 30,
    borderColor: 'gray',
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  hash: {
    paddingLeft: 5,
    paddingRight: -3,
  },
  input: {
    flex: 1,
  },
});

export default MyColorPicker;