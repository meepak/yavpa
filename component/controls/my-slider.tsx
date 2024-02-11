import React, { useState } from "react";
import { View, Text } from "react-native";
import Slider, { SliderProps } from "@react-native-community/slider";

const MySlider = (props: SliderProps) => {
  const [value, setValue] = useState(props.value);

  return (
    <View style={{ alignItems: "center" }}>
      <Text>{value && value.toFixed(2)}</Text>
      <Slider
        {...props}
        value={value}
        onValueChange={(newValue) => {
          setValue(newValue);
          if (props.onValueChange) {
            props.onValueChange(newValue);
          }
        }}
      />
    </View>
  );
};

export default MySlider;
