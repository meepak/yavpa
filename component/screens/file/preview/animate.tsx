import MyPath from "@c/my-path";
import MyPathImage from "@c/my-path-image";
import { CANVAS_VIEWBOX, MyPathDataType, TransitionType } from "@u/types";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { Svg } from "react-native-svg";

type Props = {
  myPathData: MyPathDataType;
  viewBox?: string;
  onLoopBegin?: () => void;
  onLoopEnd?: () => void;
};

const SvgAnimate = React.forwardRef((props: Props, ref: React.Ref<typeof SvgAnimate>) => {
  const AnimatedPath = Animated.createAnimatedComponent(MyPath);

  // make a shallow copy of pathData, so any animation changes don't affect the original data
  const pathData = props.myPathData.pathData.map((path) => ({ ...path }));

  // myConsole.log('pathData', pathData);

  // get the one from meta data, if using trimmed view box is what needed
  // update at commented place
  // const viewBox = getViewBox(pathData);
  const viewBox = props.viewBox || CANVAS_VIEWBOX; // props.myPathData.metaData.viewBox;

  // TODO: combine to one state
  const [animationParams, setAnimationParams] = React.useState({
    speed: 1,
    loop: true,
    delay: 0,
    transition: 0,
    transitionType: 0,
    correction: 0.05,
  });

  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;



  useEffect(() => {
    const animationData = props.myPathData.metaData.animation;
    if (animationData) {
      setAnimationParams(animationData);
    }
  }, [props.myPathData])

  // Create an array of animated values
  const animatedValues = pathData.map(() => new Animated.Value(0));


  // Create an array of animations
  const getAnimations = () => Animated.sequence([
    ...animatedValues.map((animatedValue, index) => {
      const delay = index === 0 ? 0 : 0; // Adjust the delay as needed
      const duration =
        pathData[index] && pathData[index].time
          ? pathData[index].time / animationParams.speed
          : 0;

      return Animated.sequence([
        Animated.delay(delay), //wait for delay
        Animated.timing(animatedValue, { //animate the path
          toValue: 1.0,
          duration: duration,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
      ]);
    }),
    // Conditionally add the last two sequences if loop is true
    ...(animationParams.loop ? [
      // Fade out the entire SVG in configured period
      Animated.delay(animationParams.delay * 1000),
      ...(animationParams.transitionType == TransitionType.Shrink
        ? [
          Animated.timing(scale, {
            toValue: 0.1,
            duration: (animationParams.transition ?? 0) * 1000,
            useNativeDriver: true,
          }),
        ]
        : animationParams.transitionType == TransitionType.Grow
          ? [
            Animated.timing(scale, {
              toValue: 10,
              duration: (animationParams.transition ?? 0) * 1000,
              useNativeDriver: true,
            }),
          ]
          : animationParams.transitionType == TransitionType.Shake
            ? Array.from({ length: 15 }, (_, i) => {
              const toValue = i % 3 === 0 ? 0.95 : i % 3 === 1 ? 1.05 : 1.15;
              return Animated.timing(scale, {
                toValue,
                duration: (animationParams.transition ?? 0) * 1000 / 15,
                useNativeDriver: true,
              });
            })
            : animationParams.transitionType === TransitionType.Fade
              ? [
                Animated.timing(opacity, {
                  toValue: 0.1,
                  duration: (animationParams.transition ?? 0) * 1000,
                  useNativeDriver: true,
                }),
              ]
              : []
      ),

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
  let animations = getAnimations();


  // Create the animation sequence once
  // const animationSequence = Animated.sequence(animations);

  // play animation
  const playAnimation = (startIndex = 0) => {
    // myConsole.log('playing animation')
    if (!animations) {
      // Create an array of animations
      animations = getAnimations();
    }


    // Add a listener to the first animated value
    if(props.onLoopBegin) {
      animatedValues[startIndex].addListener(({ value }) => {
        if (value === 0) {
          // This function is called at the start of each loop
          props.onLoopBegin && props.onLoopBegin();
        }
      });
    }

    // Add a listener to the last animated value
    if(props.onLoopEnd) {
      const lastAnimatedValue = animatedValues[animatedValues.length - 1];
      lastAnimatedValue.addListener(({ value }) => {
        if (value === 1) {
          // This function is called at the end of each loop
          props.onLoopEnd && props.onLoopEnd();
        }
      });
    }

    if (animationParams.loop) {
      // myConsole.log('looping', loopDelay)
      animatedValues.forEach((animatedValue) => animatedValue.setValue(0));
      animations.reset();
      Animated.loop(animations).start();
    } else {
      // myConsole.log('not looping')
      animations.start();
    }
  };

  // stop animation
  const stopAnimation = () => {
    // myConsole.log("stopping animation");
    animations.stop();

    // Remove the listeners from the first and last animated values
    if(props.onLoopBegin) {
      animatedValues[0].removeAllListeners();
    }
    if(props.onLoopEnd) {
      animatedValues[animatedValues.length - 1].removeAllListeners();
    }
  };

  // Use the useImperativeHandle hook to expose the functions
  React.useImperativeHandle(ref, () => ({
    playAnimation,
    stopAnimation,
    setAnimationParams,
  }));

  useEffect(() => {
    playAnimation();
  }, [animationParams]);

  return (
    <Animated.View style={{
      ...StyleSheet.absoluteFillObject,
      ...(animationParams.transitionType === TransitionType.Shrink ||
        animationParams.transitionType === TransitionType.Grow ||
        animationParams.transitionType === TransitionType.Shake
        ? {
          transform: [{ scale: scale }]
        }
        : animationParams.transitionType === TransitionType.Fade
          ? { opacity: opacity }
          : {}
      )
    }}>
      <Svg
        width={'100%'}
        height={'100%'}
        viewBox={viewBox}
      >
        {props.myPathData.imageData?.map((item) => (
          item.visible
            ? <MyPathImage prop={item} keyProp={"completed-" + item.guid} key={item.guid} />
            : null
        ))}

        {pathData.map((path, index) => {
          const strokeDasharray = path.length * (1 + animationParams.correction);
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
                prop={{ ...path }}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </Animated.View>
  );
});

export default SvgAnimate;
