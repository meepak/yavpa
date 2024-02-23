import { View, Text } from "react-native";
import MySlider from "@c/my-slider";
import Svg, { Line } from "react-native-svg";
import { useState } from "react";

const StrokeWidth = ({ color, opacity = 1, value, onValueChanged, w = 250, h = 100 }) => {
  const [currentValue, setCurrentValue] = useState(value)
  return (
    <>
      <View style={{ position: 'absolute', top: 7, zIndex: -2, margin: 5 }}>
        <Svg width={w} height={h}>
          <Line
            x1="5"
            y1="25"
            x2="25"
            y2="25"
            stroke={color ?? '#000000'}
            strokeWidth={currentValue}
            opacity={opacity}
          />
        </Svg>
      </View>
      <MySlider
        style={{ width: w - 20, height: 40, top: -10 }}
        name={"Stroke Width"}
        minimumValue={1}
        maximumValue={100}
        step={1}
        value={value}
        onValueChange={(value) => {
          setCurrentValue(() => value);
          onValueChanged(value);
        }}
      />
    </>
  )
}

export default StrokeWidth