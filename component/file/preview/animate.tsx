import MyPath from "@c/my-path";
import { Brushes, getBrush } from "@u/brushes";
import { BrushType, SvgDataType } from "@u/types";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Path, Svg } from "react-native-svg";

type Props = {
  svgData: SvgDataType;
};

const SvgAnimate = React.forwardRef((props: Props, ref: React.Ref<typeof SvgAnimate>) => {
  const AnimatedPath = Animated.createAnimatedComponent(MyPath);

  // make a shallow copy of pathData, so any animation changes don't affect the original data
  const pathData = props.svgData.pathData.map((path) => ({ ...path }));

  // console.log('pathData', pathData);

  // get the one from meta data, if using trimmed view box is what needed
  // update at commented place
  // const viewBox = getViewBox(pathData);
  const viewBox = props.svgData.metaData.viewBox;

  const [speed, setSpeed] = React.useState(1); // this is causing rerendering during value change
  const [loop, setLoop] = React.useState(true);
  const [loopDelay, setLoopDelay] = React.useState(0);
  const [correction, setCorrection] = React.useState(0.05);

  const opacity = useRef(new Animated.Value(1)).current;

  const animationSpeed = (value: number) => setSpeed(value);
  const animationLoop = (value: boolean) => setLoop(value);
  const animationDelay = (value: number) => setLoopDelay(value);
  const animationCleanup = (value: number) => setCorrection(value);

  

  // Create an array of animated values
  const animatedValues = pathData.map(() => new Animated.Value(0));


  // Create an array of animations
  const animations = Animated.sequence([
    ...animatedValues.map((animatedValue, index) => {
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
    }),
    // Conditionally add the last two sequences if loop is true
    ...(loop ? [
      // Fade out the entire SVG in configured period
      // Animated.delay(loopDelay),
      Animated.timing(opacity, {
        toValue: 0,
        duration: loopDelay * 1000, // Replace with the duration of the fade out
        useNativeDriver: true,
      }),


      // Reset animatedValues here to truly reset loop animation
      ...animatedValues.map((animatedValue) => {
        return Animated.timing(animatedValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        });
      }),
    ] : []),
  ]);


  // Create the animation sequence once
  // const animationSequence = Animated.sequence(animations);

  // play animation
  const playAnimation = () => {
    // console.log('playing animation')
    if (animations == undefined || !animations) {
      // Create an array of animations
      // console.log('no animations')
    }

    if (loop) {
      // console.log('looping', loopDelay)
      animatedValues.forEach((animatedValue) => animatedValue.setValue(0));
      animations.reset();
      Animated.loop(animations).start();
    } else {
      // console.log('not looping')
      animations.start();
    }
  };

  // stop animation
  const stopAnimation = () => {
    // console.log("stopping animation");
    animations.stop();
  };

  // Use the useImperativeHandle hook to expose the functions
  React.useImperativeHandle(ref, () => ({
    playAnimation,
    stopAnimation,
    animationSpeed,
    animationLoop,
    animationDelay,
    animationCleanup,
  }));

  useEffect(() => {
    // console.log('correction', correction);
    playAnimation();
  }, [speed, loop, loopDelay, correction]);

  return (
    <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity }}>
      <Svg
        style={{ flex: 1 }}
        viewBox={viewBox} // TO be included in SvgData
      >
        {pathData.map((path, index) => {
          const strokeDasharray = path.length * (1 + (props.svgData.metaData.animation?.correction || correction));
          const strokeDashoffset = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [strokeDasharray, 0],
          });
          path.strokeDasharray = strokeDasharray as any;
          path.strokeDashoffset = strokeDashoffset as any;

          return (
            <React.Fragment key={index}>
            <AnimatedPath
              key={index}
              keyProp={"animated"}
              prop={{...path }}
            />
            </React.Fragment>
          );
        })}
      </Svg>
    </Animated.View>
  );
});

export default SvgAnimate;
