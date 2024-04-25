import myConsole from "@c/controls/pure/my-console-log";
import MyPath from "@c/controls/pure/my-path";
import MyPathImage from "@c/controls/pure/my-path-image";
import {
  type AnimationParamsType,
  type MyPathDataType,
  TransitionType,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PathDataType,
  PointType,
} from "@u/types";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { Svg } from "react-native-svg";
import { useMemo } from "react";
import {
  getPathFromPoints,
  getPathLength,
  getPathLengthFromD3Points,
  getPointsFromPath,
  getViewBox,
} from "@u/helper";
import { BBox, bboxClip, lineString, polygon } from "@turf/turf";
import * as Crypto from "expo-crypto";

type Properties = {
  myPathData: MyPathDataType;
  clipByBbox?: boolean;
  onClipped?: (clippedPaths: PathDataType[]) => void;
  onLoopBegin?: () => void; // Started playing
  onLoopEnd?: () => void; // Finished playing
  onLoopStopped?: () => void; // Stopped for any reason including finished playing
};

const SvgAnimate = React.forwardRef((properties: Properties, reference) => {
  const AnimatedPath = Animated.createAnimatedComponent(MyPath);

  const pathData = useRef<PathDataType[]>([
    ...properties.myPathData.pathData.map((path) => ({
      ...path,
    })),
  ]);

  useEffect(() => {
    pathData.current = [
      ...properties.myPathData.pathData.map((path) => ({
        ...path,
      })),
    ];
    if (properties.clipByBbox !== true) {
      return;
    }
    // Get the canvas viewBox
    const canvasViewBox = getViewBox(properties.myPathData.metaData);
    const cvb = canvasViewBox.split(" ");
    const cvbp = {
      x: parseFloat(cvb[0]),
      y: parseFloat(cvb[1]),
      width: parseFloat(cvb[2]),
      height: parseFloat(cvb[3]),
    };

    // Create a bounding box polygon
    const bbox: BBox = [
      cvbp.x,
      cvbp.y,
      cvbp.x + cvbp.width,
      cvbp.y + cvbp.height,
    ];

    // console.log("before clipping", pathData.current.length, "by bbox", bbox);

    // Clip each path to the bounding box
    const newPathData = properties.myPathData.pathData.map((path) => {
      // Convert path to a line string
      const line = lineString(
        getPointsFromPath(path.path).map((point) => [point.x, point.y]),
      );

      // Clip the line to                     the bounding box
      // console.log("line", line.geometry.coordinates);
      const clipped = bboxClip(line, bbox);

      // the path is completely outside the bounding box, lets skip it
      if (!clipped || clipped.geometry.coordinates.length === 0) {
        // console.log("skipping the path", path.guid);
        return;
      }

      // console.log("clipped", clipped.geometry.coordinates);

      const clippedLineStrings =
        clipped.geometry.type === "MultiLineString"
          ? clipped.geometry.coordinates
          : [clipped.geometry.coordinates];

      const newPaths: PathDataType[] = clippedLineStrings.map((lineString) => {

        // console.log("lineString", lineString);

        const points: PointType[] = lineString.map((position) => ({
          x: position[0],
          y: position[1],
        }));

        // console.log("points", points);

        // Convert the clipped line back to a path
        const newPath = getPathFromPoints(points);
        // console.log("newPath", newPath);
        const newLength = getPathLengthFromD3Points(lineString as any);
        const newTime = (newLength / path.length) * path.time;
        // console.log("path.length", path.length, newLength);
        // console.log("path.time", path.time, newTime);

        return {
          ...path,
          time: newTime,
          length: newLength,
          path: newPath,
          guid: Crypto.randomUUID(),
        };
      });
      return newPaths;
    }).flat() as PathDataType[];

    pathData.current = newPathData.filter(
      (item): item is PathDataType => item !== undefined,
    );

    properties.onClipped && properties.onClipped(pathData.current);
    // console.log("after clipping", pathData.current.length);

  }, [properties.myPathData]);


  const canvasViewBox = useMemo(() => {
    return getViewBox(properties.myPathData.metaData);
  }, [properties.myPathData]);

  const [animationParameters, setAnimationParameters] = React.useState({
    speed: 1,
    loop: true,
    delay: 0,
    transition: 0,
    transitionType: 0,
    correction: 0.05,
  });

  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const saveAnimationParameters = (animationValues: AnimationParamsType) => {
    if (
      JSON.stringify(animationValues) !== JSON.stringify(animationParameters)
    ) {
      setAnimationParameters(animationValues);
    }
  };

  useEffect(() => {
    const animationData = properties.myPathData.metaData.animation;
    if (animationData) {
      setAnimationParameters(animationData);
    }
  }, [properties.myPathData]);

  // Create an array of animated values
  // const animatedValues = pathData.map(() => new Animated.Value(0));
  const animatedValuesReference = useRef(
    pathData.current.map(() => new Animated.Value(0)),
  );
  const isAnimationPlaying = useRef(false);

  // Create an array of animations
  const getAnimations = () =>
    Animated.sequence([
      ...animatedValuesReference.current.map((animatedValue, index) => {
        const delay = index === 0 ? 0 : 0; // Adjust the delay as needed
        const duration =
          pathData.current[index] && pathData.current[index].time
            ? pathData.current[index].time / animationParameters.speed
            : 0;

        return Animated.sequence([
          Animated.delay(delay), // Wait for delay
          Animated.timing(animatedValue, {
            // Animate the path
            toValue: 1,
            duration,
            useNativeDriver: false,
            easing: Easing.linear,
          }),
        ]);
      }),
      // Conditionally add the last two sequences if loop is true
      ...(animationParameters.loop
        ? [
            // Fade out the entire SVG in configured period
            Animated.delay(animationParameters.delay * 1000),
            ...(animationParameters.transitionType == TransitionType.Shrink
              ? [
                  Animated.timing(scale, {
                    toValue: 0.1,
                    duration: (animationParameters.transition ?? 0) * 1000,
                    useNativeDriver: true,
                  }),
                ]
              : animationParameters.transitionType == TransitionType.Grow
                ? [
                    Animated.timing(scale, {
                      toValue: 10,
                      duration: (animationParameters.transition ?? 0) * 1000,
                      useNativeDriver: true,
                    }),
                  ]
                : animationParameters.transitionType == TransitionType.Shake
                  ? Array.from({ length: 15 }, (_, i) => {
                      const toValue =
                        i % 3 === 0 ? 0.95 : i % 3 === 1 ? 1.05 : 1.15;
                      return Animated.timing(scale, {
                        toValue,
                        duration: (animationParameters.transition ?? 0) * 1000,
                        useNativeDriver: true,
                      });
                    })
                  : animationParameters.transitionType === TransitionType.Fade
                    ? [
                        Animated.timing(opacity, {
                          toValue: 0.1,
                          duration:
                            (animationParameters.transition ?? 0) * 1000,
                          useNativeDriver: true,
                        }),
                      ]
                    : []),

            // Reset animatedValues here to truly reset loop animation
            ...animatedValuesReference.current.map((animatedValue) =>
              Animated.timing(animatedValue, {
                toValue: 0,
                duration: 0,
                useNativeDriver: false,
              }),
            ),
          ]
        : []),
    ]);
  let animations = getAnimations();

  // Create the animation sequence once
  // const animationSequence = Animated.sequence(animations);

  // play animation
  const playAnimation = (startIndex = 0) => {
    // MyConsole.log('playing animation')
    if (!animations) {
      // Create an array of animations
      animations = getAnimations();
    }

    // Add a listener to the first animated value
    if (properties.onLoopBegin) {
      animatedValuesReference.current[startIndex].addListener(({ value }) => {
        if (value === 0) {
          // This function is called at the start of each loop
          properties.onLoopBegin && properties.onLoopBegin();
        }
      });
    }

    // Add a listener to the last animated value
    if (properties.onLoopEnd) {
      const lastAnimatedValue = animatedValuesReference.current.at(-1);
      if (lastAnimatedValue) {
        lastAnimatedValue.addListener(({ value }) => {
          if (value === 1) {
            // This function is called at the end of each loop
            properties.onLoopEnd && properties.onLoopEnd();
          }
        });
      }
    }

    if (animationParameters.loop) {
      // MyConsole.log('looping', animationParams)
      for (const animatedValue of animatedValuesReference.current) {
        animatedValue.setValue(0);
      }

      if (!isAnimationPlaying.current) {
        // MyConsole.log('resettig')
        animations.reset();
      }

      Animated.loop(animations).start(() => {
        properties.onLoopStopped && properties.onLoopStopped();
      });
    } else {
      // MyConsole.log('not looping')
      animations.start();
    }

    // MyConsole.log('play animation playing')
    isAnimationPlaying.current = true;
  };

  // Stop animation
  const stopAnimation = () => {
    // MyConsole.log("stopping animation");
    animations.stop();
    isAnimationPlaying.current = false;

    // Remove the listeners from the first and last animated values
    if (properties.onLoopBegin) {
      animatedValuesReference.current[0].removeAllListeners();
    }

    if (properties.onLoopEnd) {
      const lastAnimatedValue = animatedValuesReference.current.at(-1);
      if (lastAnimatedValue) {
        lastAnimatedValue.removeAllListeners();
      }
    }
  };

  // Use the useImperativeHandle hook to expose the functions
  React.useImperativeHandle(reference, () => ({
    playAnimation,
    stopAnimation,
    saveAnimationParams: saveAnimationParameters,
  }));

  // UseEffect(() => {
  //   playAnimation();
  // }, [animationParams]);

  useEffect(() => {
    if (isAnimationPlaying.current) {
      playAnimation();
    }
  });

  useEffect(() => {
    playAnimation();
    isAnimationPlaying.current = true;
  }, []);

  return (
    <Animated.View
      style={{
        ...StyleSheet.absoluteFillObject,
        ...(animationParameters.transitionType === TransitionType.Shrink ||
        animationParameters.transitionType === TransitionType.Grow ||
        animationParameters.transitionType === TransitionType.Shake
          ? {
              transform: [{ scale }],
            }
          : animationParameters.transitionType === TransitionType.Fade
            ? { opacity }
            : {}),
      }}
    >
      <Svg width={"100%"} height={"100%"} viewBox={canvasViewBox}>
        {properties.myPathData.imageData?.map((item) =>
          item.visible ? (
            <MyPathImage
              prop={item}
              keyProp={"completed-" + item.guid}
              key={item.guid}
            />
          ) : null,
        )}

        {pathData.current.map((path, index) => {
          const strokeDasharray =
            path.length * (1 + animationParameters.correction);
          const strokeDashoffset = animatedValuesReference.current[
            index
          ]?.interpolate({
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
