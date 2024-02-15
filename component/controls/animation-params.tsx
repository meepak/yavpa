import { View , Text} from "react-native";
import MySlider from "@c/controls/my-slider";
import { useEffect, useState } from "react";
import MyCheckBox from "@c/my-check-box";

const AnimationParams = ({ speed, onSpeedChanged, loopStatus, onLoopStatusChanged, loopDelay, onLoopDelayChanged }) => {
  const [speedValue, setSpeedValue] = useState(speed ?? 1)
  const [loopStatusValue, setLoopStatusValue] = useState(loopStatus ?? true)
  const [loopDelayValue, setLoopDelayValue] = useState(loopDelay ?? 0)

  return (
    <>
      <View style={{ position: 'absolute', top: 7 }}>
        <Text style={{fontWeight: 'bold'}}>Animation Speed</Text>
      </View>
      <MySlider
        style={{ width: 250, height: 40, top: -10 }}
        minimumValue={0.1}
        maximumValue={3}
        value={speedValue}
        onValueChange={(value) => {
          setSpeedValue(() => value);
          onSpeedChanged(value);
        }}
      /> 
      <MyCheckBox 
      checked={loopStatusValue} 
      label="Loop Playback" 
      iconStyle={{ color: '#000000', size: 22 }}
      onChange={(value) => {
        setLoopStatusValue(() => value)
        onLoopStatusChanged(value);
      }} />
      <View style={{ top: 10, left: -20 }}>
      <Text style={{fontWeight: 'bold'}}>Loop Delay</Text>
    </View>
    <MySlider
      style={{ width: 250, height: 40, top: -5 }}
      minimumValue={0}
      maximumValue={10}
      value={loopDelayValue}
      onValueChange={(value) => {
        setLoopDelayValue(() => value);
        onLoopDelayChanged(value);
      }}
    />
    </>
  )
}

export default AnimationParams