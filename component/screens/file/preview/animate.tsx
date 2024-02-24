import MyPath from "@c/my-path";
import { DEFAULT_VIEWBOX, SvgDataType } from "@u/types";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { Svg } from "react-native-svg";

type Props = {
  svgData: SvgDataType;
  viewBox?: string;
};

const SvgAnimate = React.forwardRef((props: Props, ref: React.Ref<typeof SvgAnimate>) => {
  const AnimatedPath = Animated.createAnimatedComponent(MyPath);

  // make a shallow copy of pathData, so any animation changes don't affect the original data
  const pathData = props.svgData.pathData.map((path) => ({ ...path }));

  // console.log('pathData', pathData);

  // get the one from meta data, if using trimmed view box is what needed
  // update at commented place
  // const viewBox = getViewBox(pathData);
  const viewBox = props.viewBox || DEFAULT_VIEWBOX; // props.svgData.metaData.viewBox;

  // TODO: combine to one state
  const [animationParams, setAnimationParams] = React.useState({
    speed: 1,
    loop: true,
    delay: 0,
    correction: 0.05,
  });
  // const [speed, setSpeed] = React.useState(1); // this is causing rerendering during value change
  // const [loop, setLoop] = React.useState(true);
  // const [loopDelay, setLoopDelay] = React.useState(0);
  // const [correction, setCorrection] = React.useState(0.05);

  const opacity = useRef(new Animated.Value(1)).current;

  // const animationSpeed = (value: number) => setSpeed(value);
  // const animationLoop = (value: boolean) => setLoop(value);
  // const animationDelay = (value: number) => setLoopDelay(value);
  // const animationCleanup = (value: number) => setCorrection(value);

  
  useEffect(() => 
  {
    const animationData = props.svgData.metaData.animation;
    if(animationData) {
      setAnimationParams(animationData);
    }
  }, [props.svgData])

  // Create an array of animated values
  const animatedValues = pathData.map(() => new Animated.Value(0));


  // Create an array of animations
  const animations = Animated.sequence([
    ...animatedValues.map((animatedValue, index) => {
      const delay = index === 0 ? 0 : 0; // Adjust the delay as needed
      const duration =
        pathData[index] && pathData[index].time
          ? pathData[index].time / animationParams.speed
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
    ...(animationParams.loop ? [
      // Fade out the entire SVG in configured period
      // Animated.delay(loopDelay),
      Animated.timing(opacity, {
        toValue: 0.1,
        duration: animationParams.delay * 1000, // duration of the fade out
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

    if (animationParams.loop) {
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
    setAnimationParams,
    // animationSpeed,
    // animationLoop,
    // animationDelay,
    // animationCleanup,
  }));

  useEffect(() => {
    // console.log('correction', correction);
    playAnimation();
  }, [animationParams]);

  return (
    <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity }}>
      <Svg
        style={{ flex: 1 }}
        viewBox={viewBox} 
      >
        {pathData.map((path, index) => {
          const strokeDasharray = path.length * (1 + (props.svgData.metaData.animation?.correction || animationParams.correction));
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
