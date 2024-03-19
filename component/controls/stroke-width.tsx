import { View } from "react-native";
import MySlider from "@c/my-slider";
import { useState } from "react";
import StrokePreview from "./stroke-preview";

const StrokeWidth = ({ stroke, strokeOpacity, value, onValueChanged }) => {
  const [currentValue, setCurrentValue] = useState(value)

  const handleValueChange = (value: number) => {
    setCurrentValue(value);
    onValueChanged(value);
  }
  return (
    <View>
      <View style={{ position: 'absolute', top: 0, left: 0 , width: 60, height: 100}}>
        <StrokePreview stroke={stroke} strokeWidth={currentValue} strokeOpacity={strokeOpacity} width={60} height={100} />
      </View>
      <View style={{ width: 40, height: 350 }}>
        <MySlider
          name={"Stroke Width"}
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={currentValue}
          onValueChange={handleValueChange}

          />
      </View>
    </View>
  )
}

export default StrokeWidth