import { View , Text} from "react-native";
import MySlider from "@c/controls/my-slider";
import { useEffect, useState } from "react";

const PlaySpeed = ({ value, onValueChanged }) => {
  const [currentValue, setCurrentValue] = useState(value)
  useEffect(() => {
    console.log('currentValue', currentValue);
  }, [currentValue])

  return (
    <>
      <View style={{ position: 'absolute', top: 7, zIndex: -2 }}>
        <Text style={{fontWeight: 'bold'}}>Animation Speed</Text>
      </View>
      <MySlider
        style={{ width: 250, height: 40, top: -10 }}
        minimumValue={0.1}
        maximumValue={2}
        value={currentValue}
        onValueChange={(value) => {
          setCurrentValue(() => value);
          onValueChanged(value);
        }}
      />
    </>
  )
}

export default PlaySpeed