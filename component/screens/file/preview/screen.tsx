import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import SvgAnimate from "./animate";
import createPreviewControls from "./control";
import { AnimationParamsType, CANVAS_WIDTH, MY_BLACK, SvgAnimateHandle } from "@u/types";
import Svg, { Line } from "react-native-svg";
import myConsole from "@c/my-console-log";
// import myConsole from "@c/my-console-log";

const AnimatedLine = Animated.createAnimatedComponent(Line);
interface AnimationTrackBarProps {
  currentWidth: Animated.Value;
}
const AnimationTrackBar = React.forwardRef<any, AnimationTrackBarProps>(({ currentWidth }, ref) => {
  return (
    <Svg height="5" width={CANVAS_WIDTH}>
      <AnimatedLine
        x1="0"
        y1="0"
        x2={currentWidth}
        y2="0"
        stroke="#5d747e"
        strokeWidth="2"
      /><AnimatedLine
        x1="0"
        y1="2"
        x2={currentWidth}
        y2="2"
        stroke={MY_BLACK}
        strokeWidth="1"
      />
    </Svg>
  )
});

const PreviewScreen = ({ myPathData, setMyPathData, initControls }) => {

  const [animationParams, setAnimationParams] = useState<AnimationParamsType>({
    speed: myPathData.metaData.animation?.speed || 1,
    loop: myPathData.metaData.animation?.loop || true,
    delay: myPathData.metaData.animation?.delay || 0,
    transition: myPathData.metaData.animation?.transition || 0,
    transitionType: myPathData.metaData.animation?.transitionType || 0,
    correction: myPathData.metaData.animation?.correction || 0.05,
  });

  const totalPlayTime = useRef(0);
  const currentProgress = useRef(new Animated.Value(0));
  const [trackAnimation, setTrackAnimation] = useState<Animated.CompositeAnimation>();
  const previewRef = useRef<SvgAnimateHandle | null>(null);


  useEffect(() => {
    trackAnimation && trackAnimation.start();
    // on leaving clear the controls
    return () => initControls([]);
  }, []);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.saveAnimationParams(animationParams);
    }
    if (myPathData.metaData.animation && (JSON.stringify(myPathData.metaData.animation) !== JSON.stringify(animationParams))) {
      // myConsole.log('animation params updated, should trigger saving to file');
      setMyPathData((prev) => ({ ...prev, metaData: { ...prev.metaData, animation: animationParams, updatedAt: "" } }));
    }

    initControls(buttons)
  }, [animationParams]);

  useEffect(() => {
    totalPlayTime.current = myPathData.pathData.reduce((acc, path) => acc + path.time, 0);
    // check if  animation is speeded up or down
    totalPlayTime.current = totalPlayTime.current / animationParams.speed;
    console.log('totalPlayTime', totalPlayTime.current, "canvas width", CANVAS_WIDTH);
    // currentProgress.current.addListener(({ value }) => console.log("VALUE", value));
    setTrackAnimation(Animated.timing(currentProgress.current, {
      toValue: CANVAS_WIDTH,
      duration: totalPlayTime.current,
      useNativeDriver: false,
    }));
  }, [myPathData, animationParams]);

  const onPreviewPlay = () => {
    if (previewRef.current) {
      previewRef.current.playAnimation();
    }
  }
  const onPreviewStop = () => {
    if (previewRef.current) {
      previewRef.current.stopAnimation();
    }
  }

  // In your component:
  const buttons = createPreviewControls({
    onPreviewPlay,
    onPreviewStop,
    animationParams,
    setAnimationParams,
  });

  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
      <View style={{ width: CANVAS_WIDTH, height: 10, zIndex: 999}}>
      {
          (totalPlayTime.current >= 0) && <AnimationTrackBar currentWidth={currentProgress.current} />
      }
      </View>
      <SvgAnimate
        ref={previewRef}
        myPathData={myPathData}
        onLoopBegin={() => {
          // myConsole.log('loop begin');
          trackAnimation?.start(() => myConsole.log('tracker loop end'));

        }}

        onLoopEnd={() => {
          // myConsole.log('loop end');
          trackAnimation?.reset();
        }}


        // how to distinguish stopped or paused??
        onLoopStopped={() => {
          // myConsole.log('loop stopped');
          trackAnimation?.reset();
        }}

        />
    </View>
  );
};

export default PreviewScreen;
