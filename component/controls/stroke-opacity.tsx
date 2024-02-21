import { View, Text } from "react-native";
import MySlider from "@c/controls/my-slider";
import Svg, { Line } from "react-native-svg";
import { useState } from "react";

const StrokeOpacity = ({ indicator, color, strokeWidth, value, onValueChanged }) => {
  const [currentValue, setCurrentValue] = useState(value)
  return (
    <>
        <Text style={{ fontWeight: 'bold', alignSelf: 'center' }}>Stroke Opacity</Text>
      <View style={{ position: 'absolute', top: 7, zIndex: -2, margin: 5 }}>
        {
          indicator
            ? <Svg height="100" width="250">
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
      {/* <MySlider
        style={{ width: 210, left: 20, right: 20, height: 40, top: -10 }}
        minimumValue={0}
        maximumValue={1}
        value={currentValue}
        onValueChange={(value) => {
          setCurrentValue(() => value);
          onValueChanged(value);
        }}
      /> */}
    </>
  )
}

export default StrokeOpacity