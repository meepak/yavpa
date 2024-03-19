import { View } from "react-native";
import MySlider from "@c/my-slider";
import { useState } from "react";
import MyCheckBox from "@c/my-check-box";
import { TransitionType } from "@u/types";

const AnimationParams = ({ animationParams, onAnimationParamsChanged }) => {
  const [speedValue, setSpeedValue] = useState(animationParams.speed ?? 1)
  const [loopStatusValue, setLoopStatusValue] = useState(animationParams.loop ?? true)
  const [loopDelayValue, setLoopDelayValue] = useState(animationParams.delay ?? 0)
  const [loopTransitionValue, setLoopTransitionValue] = useState(animationParams.transition ?? 0)
  const [loopTransitionTypeValue, setLoopTransitionTypeValue] = useState(animationParams.transitionType ?? TransitionType.Fade)

  return (
    <>
      <View style={{ position: 'absolute', top: 17, zIndex: -2, margin: 5 }}>
      </View>
      <MySlider
        horizontal={true}
        style={{ width: 250, height: 40, top: -10 }}
        name={"Animation Speed"}
        minimumValue={0.01}
        maximumValue={10}
        step={0.01}
        suffix={" x Current Path Time"}
        value={speedValue}
        plusMinusButtons={false}
        onValueChange={(value) => {
          setSpeedValue(() => value); // TODO this should be removable as it is updated back from below event
          onAnimationParamsChanged({ ...animationParams, speed: value });
        }}
      />
      <View style={{ top: -10, alignItems: 'center' }}>
        <MyCheckBox
          checked={loopStatusValue}
          label="Loop the animation:"
          iconStyle={{ color: '#120e31', size: 22 }}
          textStyle={{ color: '#120e31', fontSize: 16, fontWeight: 'bold' }}
          onChange={(value) => {
            setLoopStatusValue(() => value);
            onAnimationParamsChanged({ ...animationParams, loop: value });
          }} />
      </View>
      <MySlider
        horizontal={true}
        style={{ width: 250, height: 40, top: -5 }}
        name={"Delay between each loop"}
        minimumValue={0}
        maximumValue={15}
        suffix={' secs'}
        value={loopDelayValue}
        plusMinusButtons={false}
        onValueChange={(value) => {
          setLoopDelayValue(() => value);
          onAnimationParamsChanged({ ...animationParams, delay: value });
        }}
      />
      <MySlider
        horizontal={true}
        style={{ width: 250, height: 40, top: -5 }}
        name={"Time to transition to next loop"}
        minimumValue={0}
        maximumValue={15}
        suffix={' secs'}
        value={loopTransitionValue}
        plusMinusButtons={false}
        onValueChange={(value) => {
          setLoopTransitionValue(() => value);
          onAnimationParamsChanged({ ...animationParams, transition: value });
        }}
      />
      {/* To select transition type, need drop or check boxes arrangement, later */}
    </>
  )
}

export default AnimationParams