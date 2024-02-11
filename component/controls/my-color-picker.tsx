import React from 'react';
import { View } from 'react-native';
import ColorPicker from 'react-native-wheel-color-picker';

const MyColorPicker = ({ initialColor = '#000000', onColorSelected }) =>
  <View style={{width: 300, top: -15}}>
    <ColorPicker
      // ref={r => { this.picker = r }}
      color={initialColor}
      swatchesOnly={false}
      onColorChange={() => { }}
      onColorChangeComplete={onColorSelected}
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
      // wheelLodingIndicator={<ActivityIndicator size={40} />}
      // sliderLodingIndicator={<ActivityIndicator size={20} />}
      useNativeDriver={false}
      useNativeLayout={false}
    /></View>

export default MyColorPicker;