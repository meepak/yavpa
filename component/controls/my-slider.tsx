import React, { useState } from "react";
import { View, Text } from "react-native";
import Slider, { SliderProps } from "@react-native-community/slider";

interface MySliderProps extends SliderProps {
  name: string;
  suffix?: string;
}

const MySlider = (props: MySliderProps) => {
  const [value, setValue] = useState(props.value);

  return (
    <View style={{ alignItems: "center" }}>
    <Text style={{fontWeight: 'bold', alignSelf: 'center', marginBottom: 5 }}>{props.name}</Text>
      <Text>{value && value.toFixed(2)}{props.suffix || ""}</Text>
      <Slider
        {...props}
        tapToSeek={true}
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
