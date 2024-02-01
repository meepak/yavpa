import React from "react";
import { Animated, View, StyleSheet, Easing, Dimensions } from "react-native";
import { Svg, Path } from "react-native-svg";
import { SvgDataType, getViewBox } from "../../utilities/helper";

type Props = {
  svgData: SvgDataType;
};
const SvgPreview = React.forwardRef((props: Props, ref: React.Ref<unknown> | undefined) => {
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  const pathData = props.svgData.pathData;

  // get the one from meta data, if using trimmed view box is what needed
  // update at commented place
  // const viewBox = getViewBox(pathData);
  const viewBox = props.svgData.metaData.viewBox;

  const [speed, setSpeed] = React.useState(1);

  // Create an array of animated values
  const animatedValues = pathData.map(() => new Animated.Value(0));

  // Create an array of animations
  const animations = animatedValues.map((animatedValue, index) => {
    const delay = index === 0 ? 0 : 0; // Adjust the delay as needed
    const duration =
      pathData[index] && pathData[index].time
        ? pathData[index].time * speed
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
  });

  // set speed
  const animationSpeed = (value) => setSpeed(value);

  // play animation
  const playAnimation = () => {
    Animated.sequence(animations)?.start();
  };

  // loop animation
  const loopAnimation = () => {
    // console.log("looping animation");

    playAnimation();
    // console.log("looping animation");
    Animated.loop(Animated.sequence(animations))?.start();
  };

  // replay animation
  const replayAnimation = () => {
    // console.log("replaying animation");
    // Reset all animated values to 0
    animatedValues.forEach((animatedValue) => animatedValue.setValue(0));

    // Start the animations in sequence
    playAnimation();
    // Animated.loop(Animated.sequence(animations))?.start();
  };

  // stop animation
  const stopAnimation = () => {
    // console.log("stopping animation");
    Animated.loop(Animated.sequence(animations))?.stop();
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

export default SvgPreview;
