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
      <View style={{ position: 'absolute', top: 17, zIndex: -2, margin: 5 }}>
      </View>
      <MySlider
        style={{ width: 250, height: 40, top: -10 }}
        name={"Animation Speed"}
        minimumValue={0}
        maximumValue={10}
        step={0.01}
        suffix={" x Current Path Time"}
        value={speedValue}
        onValueChange={(value) => {
          setSpeedValue(() => value);
          onSpeedChanged(value);
        }}
      /> 
      <View style={{ top: -10, alignItems: 'center' }}>
      <MyCheckBox 
      checked={loopStatusValue} 
      label="Loop the animation:" 
      iconStyle={{ color: '#000000', size: 22 }}
      textStyle={{ color: '#000000', fontSize: 16 , fontWeight: 'bold'}}  
      onChange={(value) => {
        setLoopStatusValue(() => value)
        onLoopStatusChanged(value);
      }} />
    </View>
    <MySlider
      style={{ width: 250, height: 40, top: -5 }}
      name={"Delay between each loop"}
      minimumValue={0}
      maximumValue={15}
      suffix={' secs'}
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