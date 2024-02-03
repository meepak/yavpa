import { View } from "react-native";
import MySlider from "@c/controls/slider";
import Svg, { Line } from "react-native-svg";
import { useState } from "react";

const StrokeWidth = ({color = 'black', value, onValueChanged}) => {
    const [currentValue, setCurrentValue] = useState(value)
    return (
        <>
          <View style={{ position: 'absolute', top: 7, zIndex: -2 }}>
            <Svg height="100" width="250">
              <Line
                x1="5"
                y1="25"
                x2="25"
                y2="25"
                stroke={color}
                strokeWidth={currentValue}
              />
            </Svg>
          </View>
          <MySlider
            style={{ width: 250, height: 40, top: -10 }}
            minimumValue={1}
            maximumValue={100}
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