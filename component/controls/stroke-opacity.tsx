import { View, Text } from "react-native";
import MySlider from "@c/my-slider";
import Svg, { Line } from "react-native-svg";
import { useState } from "react";

const StrokeOpacity = ({ indicator, color, strokeWidth, value, onValueChanged, w = 250, h = 100 }) => {
  const [currentValue, setCurrentValue] = useState(value)
  return (
    <>
      <View style={{ position: 'absolute', top: 7, zIndex: -2, margin: 5 }}>
        {
          indicator
            ? <Svg width={w} height={h}>
              <Line
                x1="5"
                y1="25"
                x2="25"
                y2="25"
                stroke={color ?? '#000000'}
                strokeWidth={strokeWidth ?? 10}
                opacity={value}
              />
            </Svg>
            : null
        }
      </View>
      <MySlider
        style={{ width: w - 20, height: 40, top: -10 }}
        name={"Stroke Opacity"}
        minimumValue={0}
        maximumValue={1}
        value={currentValue}
        onValueChange={(value) => {
          setCurrentValue(() => value);
          onValueChanged(value);
        }}
      />
    </>
  )
}

export default StrokeOpacity