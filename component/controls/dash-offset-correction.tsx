import { View , Text} from "react-native";
import MySlider from "@c/my-slider";
import { useState } from "react";

const DashOffsetCorrection = ({ value, onValueChanged }) => {
  const [currentValue, setCurrentValue] = useState(value)
  return (
    <View>
      {/* <View style={{ position: 'absolute', top: 7, zIndex: -2, margin: 5 }}>
        <Text style={{fontWeight: 'bold'}}>Adjust this value till,</Text>
        <Text style={{fontWeight: 'bold'}}>all fragments disappears.</Text>
      </View> */}

      <MySlider
        name = {"Adjust value to cleanup pre-animation artifacts"}
        style={{ width: 250, height: 40, top: -10 }}
        minimumValue={0.0001}
        maximumValue={0.25}
         horizontal={true}
        step={0.001}
        value={currentValue}
        onValueChange={(value) => {
          setCurrentValue(() => value); // should be remvoable
          onValueChanged(value);
        }}
      />
    </View>
  )
}

export default DashOffsetCorrection