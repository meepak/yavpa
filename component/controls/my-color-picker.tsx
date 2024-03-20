import { MY_BLACK } from '@u/types';
import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';

const MyColorPicker = ({ initialColor = MY_BLACK, onColorSelected }) => {
  const [inputColor, setInputColor] = useState(initialColor);

  const isValidHex = (text) => /^#([A-Fa-f0-9]{6})?$/.test(text);

  return (
    <View style={{ width: 90, height: 400 }}>
      <ColorPicker
        color={isValidHex(inputColor) ? inputColor : initialColor}
        swatchesOnly={false}
        onColorChange={(color) => {
          // myConsole.log('color changed', color);
          setInputColor(color);
          if (isValidHex(color)) {
            onColorSelected(color);
          }
        }}
        // onColorChangeComplete={(color) => {
        //   myConsole.log('color changed complete', color);
        //   setInputColor(color);
        //   if (isValidHex(color)) {
        //     onColorSelected(color);
        //   }
        // }}
        thumbSize={30}
        gapSize={0}
        noSnap={true}
        row={true}
        swatches={true}
        discrete={true}
        shadeWheelThumb={true}
        shadeSliderThumb={false}
        useNativeDriver={true}
        useNativeLayout={true}
        wheelHidden={false}
        autoResetSlider={false}
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
    width: 100,
    height: 30,
    borderWidth: 0,
    backgroundColor: 'transparent',
    position: 'absolute',
    marginTop: 65,
    marginLeft: -5,
  },
  hash: {
    marginLeft: 20,
  },
  input: {
    flex: 1,
    // borderBottomWidth: 0,
  },
});

export default MyColorPicker;