import { View , Text} from "react-native";
import MySlider from "@c/controls/my-slider";
import { useState } from "react";

const DashOffsetCorrection = ({ value, onValueChanged }) => {
  const [currentValue, setCurrentValue] = useState(value)
  return (
    <>
      <View style={{ position: 'absolute', top: 7, zIndex: -2, margin: 5 }}>
        <Text style={{fontWeight: 'bold'}}>Adjust this value till,</Text>
        <Text style={{fontWeight: 'bold'}}>all fragments disappears.</Text>
      </View>

      <View style={{ top: 37, zIndex: -2, margin: 5 }}>
      <MySlider
        style={{ width: 250, height: 40, top: -10 }}
        minimumValue={0.001}
        maximumValue={0.15}
        step={0.001}
        value={currentValue}
        onValueChange={(value) => {
          setCurrentValue(() => value);
          onValueChanged(value);
        }}
      />
         </View>
    </>
  )
}

export default DashOffsetCorrection