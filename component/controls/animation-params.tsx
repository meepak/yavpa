import { Text, View } from "react-native";
import MySlider from "@c/my-slider";
import { useEffect, useState } from "react";
import MyCheckBox from "@c/my-check-box";
import { MY_BLACK, TransitionType } from "@u/types";
import RadioButtons from "@c/my-radio-buttons";
import myConsole from "@c/my-console-log";

const AnimationParams = ({ animationParams, onAnimationParamsChanged }) => {
  const [speedValue, setSpeedValue] = useState(animationParams.speed ?? 1)
  const [loopStatusValue, setLoopStatusValue] = useState(animationParams.loop ?? true)
  const [loopDelayValue, setLoopDelayValue] = useState(animationParams.delay ?? 0)
  const [loopTransitionValue, setLoopTransitionValue] = useState(animationParams.transition ?? 0)
  const [loopTransitionTypeValue, setLoopTransitionTypeValue] = useState(animationParams.transitionType ?? TransitionType.Fade)

  useEffect(() => {
    myConsole.log('animationParams', animationParams);
  }, [animationParams])

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
      <View style={{ alignItems: 'center' }}>
        <MyCheckBox
          checked={loopStatusValue}
          label="Loop the animation:"
          iconStyle={{ color: 'transparent', fill:MY_BLACK, size: 22 }}
          textStyle={{ color: MY_BLACK, fontSize: 16, fontWeight: 'bold' }}
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

        <View style={{ alignItems: 'flex-start' }}>
          <Text style={{ color: MY_BLACK, fontWeight: 'bold' }}>Transition Type:</Text>
        <RadioButtons
          iconStyle={{ color: 'transparent', fill: MY_BLACK, size: 22 }}
          labels={['Fade', 'Shrink']} //'Vibrate',
          values={[TransitionType.Fade as any, TransitionType.Shrink]} //TransitionType.Vibrate,
          initialValue={animationParams.transitionType}
          onChange={(value) => {
              setLoopTransitionTypeValue(() => value);
              onAnimationParamsChanged({ ...animationParams, transitionType: value });
            }}
          />
          </View>
    </>
  )
}

export default AnimationParams