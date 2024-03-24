import { View } from "react-native";
import MySlider from "@c/my-slider";
import { useContext, useEffect, useState } from "react";
import StrokePreview from "./stroke-preview";
import { MyPathDataContext } from "@x/svg-data";

const StrokeOpacity = ({ stroke, strokeWidth, value, onValueChanged }) => {
  const [currentValue, setCurrentValue] = useState(value)
  const {myPathData } = useContext(MyPathDataContext);

  useEffect(() => {
    const selectedPathOpacity = myPathData.pathData.find((path) => path.selected)?.strokeOpacity;
    if (selectedPathOpacity !== undefined) {
      setCurrentValue(selectedPathOpacity);
    }
  }, []);
  const handleValueChange = (value: number) => {
    setCurrentValue(() => value);
    onValueChanged(value);
  }
  return (
    <View>
      <View style={{ position: 'absolute', top: 0, left: 0 , width: 60, height: 100}}>
        <StrokePreview stroke={stroke} strokeWidth={strokeWidth} strokeOpacity={currentValue} width={60} height={100} />
      </View>
      <View style={{ width: 40, height: 350 }}>
      <MySlider
        name={"Stroke Opacity"}
        minimumValue={0.01}
        maximumValue={1}
        step={0.01}
        value={currentValue}
        onValueChange={handleValueChange}
        vertical={true}
      />
      </View>
    </View>
  )
}

export default StrokeOpacity