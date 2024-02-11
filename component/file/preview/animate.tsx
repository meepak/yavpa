import React, { useEffect } from "react";
import { Animated, View, StyleSheet, Easing, Dimensions } from "react-native";
import { Svg, Path } from "react-native-svg";
import { SvgDataType, getViewBoxTrimmed } from "@u/helper";

type Props = {
  svgData: SvgDataType;
};

export interface SvgAnimateHandle {
  playAnimation: () => void;
  loopAnimation: () => void;
  replayAnimation: () => void;
  stopAnimation: () => void;
  animationSpeed: (value: number) => void;
}

const SvgAnimate = React.forwardRef((props: Props, ref: React.Ref<typeof SvgAnimate>) => {
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  const pathData = props.svgData.pathData;

  // get the one from meta data, if using trimmed view box is what needed
  // update at commented place
  // const viewBox = getViewBox(pathData);
  const viewBox = props.svgData.metaData.viewBox;

  // const [speed, setSpeed] = React.useState(1); // this is causing rerendering during value change

  let speed = 1;
  const setSpeed = (value: number) => {speed = value}
  // set speed
  const animationSpeed = (value: number) => setSpeed(value);

  // Create an array of animated values
  const animatedValues = pathData.map(() => new Animated.Value(0));

  // Create an array of animations
  const animations = Animated.sequence(animatedValues.map((animatedValue, index) => {
    const delay = index === 0 ? 0 : 0; // Adjust the delay as needed
    const duration =
      pathData[index] && pathData[index].time
        ? pathData[index].time / speed
        : 0;

    return Animated.sequence([
      Animated.delay(delay),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
        easing: Easing.linear,
      }),
    ]);
  }));

  useEffect(() => {
    animatedValues.forEach((animatedValue, index) => {
      console.log(`animatedValue[${index}]: ${animatedValue.__getValue()}`);
    });
  }, [animatedValues]);

  // Create the animation sequence once
// const animationSequence = Animated.sequence(animations);

// play animation
const playAnimation = () => {
  console.log('playing animation')
  animations.start();
};

// loop animation
const loopAnimation = () => {
  console.log("looping animation");

  animatedValues.forEach((animatedValue) => animatedValue.setValue(0));
  animations.reset();
  Animated.loop(animations).start();
};

// replay animation, can't find the use as play is sufficient.
const replayAnimation = () => {
  console.log("replaying animation");
  // Reset all animated values to 0, this clears up the screen
  animatedValues.forEach((animatedValue) => animatedValue.setValue(0));
  animations.reset();
  animations.start();

  // Start the animations in sequence
  // playAnimation();
};

// stop animation
const stopAnimation = () => {
  console.log("stopping animation");
  animations.stop();
};

  // Start the animations in sequence
  // playAnimation();

  // Use the useImperativeHandle hook to expose the loopAnimation and replayAnimation methods to the parent component
  React.useImperativeHandle(ref, () => ({
    playAnimation,
    loopAnimation,
    replayAnimation,
    stopAnimation,
    animationSpeed,
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg
        style={{ flex: 1 }}
        viewBox={viewBox} // TO be included in SvgData
      >
        {pathData.map((path, index) => {
          
          const strokeDashoffset = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [path.length, 0],
          });

          return (
            <AnimatedPath
              key={index}
              d={path.path}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              strokeLinecap={path.strokeCap}
              strokeLinejoin={path.strokeJoin}
              opacity={path.strokeOpacity}
              fill="none"
              strokeDasharray={path.length}
              strokeDashoffset={strokeDashoffset}
            />
          );
        })}
      </Svg>
    </View>
  );
});

export default SvgAnimate;
