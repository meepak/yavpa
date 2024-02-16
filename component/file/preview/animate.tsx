import { Brushes, getBrush } from "@u/brushes";
import { BrushType, SvgDataType } from "@u/types";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Path, Svg } from "react-native-svg";

type Props = {
  svgData: SvgDataType;
};

const SvgAnimate = React.forwardRef((props: Props, ref: React.Ref<typeof SvgAnimate>) => {
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  const pathData = props.svgData.pathData;

  // console.log('pathData', pathData);

  // get the one from meta data, if using trimmed view box is what needed
  // update at commented place
  // const viewBox = getViewBox(pathData);
  const viewBox = props.svgData.metaData.viewBox;

  const [speed, setSpeed] = React.useState(1); // this is causing rerendering during value change
  const [loop, setLoop] = React.useState(true);
  const [loopDelay, setLoopDelay] = React.useState(0);

  const opacity = useRef(new Animated.Value(1)).current;

  const animationSpeed = (value: number) => setSpeed(value);
  const animationLoop = (value: boolean) => setLoop(value);
  const animationDelay = (value: number) => setLoopDelay(value);

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
    console.log('playing animation')
    if (animations == undefined || !animations) {
      // Create an array of animations
      console.log('no animations')
    }

    if (loop) {
      console.log('looping', loopDelay)
      animatedValues.forEach((animatedValue) => animatedValue.setValue(0));
      animations.reset();
      Animated.loop(animations).start();
    } else {
      console.log('not looping')
      animations.start();
    }
  };

  // stop animation
  const stopAnimation = () => {
    console.log("stopping animation");
    animations.stop();
  };

  // Use the useImperativeHandle hook to expose the functions
  React.useImperativeHandle(ref, () => ({
    playAnimation,
    stopAnimation,
    animationSpeed,
    animationLoop,
    animationDelay,
  }));

  useEffect(() => {
    playAnimation();
  }, [speed, loop, loopDelay]);

  return (
    <Animated.View style={{ ...StyleSheet.absoluteFillObject, opacity }}>
      <Svg
        style={{ flex: 1 }}
        viewBox={viewBox} // TO be included in SvgData
      >
        {pathData.map((path, index) => {
          const offsetFactor = 0.05; // Adjust this value as needed
          const strokeDasharray = path.length * (1 + offsetFactor);
          const strokeDashoffset = animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [strokeDasharray, 0],
          });
          let brush: BrushType | undefined;
          if (path.stroke.startsWith("url(#")) {
            const brushGuid = path.stroke.slice(5, -1);
            brush = Brushes.find(brush => brush.params.guid === brushGuid);
          }

          return (
            <React.Fragment key={index}>
              {brush && getBrush(brush)}
            <AnimatedPath
              key={index}
              d={path.path}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              strokeLinecap={path.strokeCap}
              strokeLinejoin={path.strokeJoin}
              opacity={path.strokeOpacity}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
            />
            </React.Fragment>
          );
        })}
      </Svg>
    </Animated.View>
  );
});

export default SvgAnimate;
