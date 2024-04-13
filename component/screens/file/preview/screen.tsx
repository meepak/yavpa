import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import SvgAnimate from "./animate";
import createPreviewControls from "./control";
import { AnimationParamsType, CANVAS_WIDTH, MY_BLACK, MyPathDataType, SvgAnimateHandle } from "@u/types";
import Svg, { Line } from "react-native-svg";

const AnimatedLine = Animated.createAnimatedComponent(Line);

type AnimationTrackBarType = {
  myPathData: MyPathDataType;
  animationParams: AnimationParamsType;
};


interface AnimationTrackBarInterface extends AnimationTrackBarType {
  play: () => void;
  stop: () => void;
  reset: () => void;
}


const AnimationTrackBar = React.forwardRef(({ myPathData, animationParams }: AnimationTrackBarType , ref) => {
  // Calculate the total animation time
  const totalAnimTime = myPathData?.pathData.reduce((acc, item) => acc + item.time, 0) ;

  // Create an array to store the animations
  const animationsX2:any[] = [];

  // Create a reference to store the animation
  const animationX2Ref = useRef<Animated.CompositeAnimation | undefined>();
  const [animatedX2Values, setAnimatedX2Values] = useState<Animated.Value[]>([]);
  const [allLines, setAllLines] = useState<{index: number, x1: number, color: string }[]>([]);

  const createAnimation = () => {
    let startX = 0;
    const newAnimatedValues:any[] = [];
    const newAllLines:any[] = [];
    myPathData?.pathData.map((path, index) => {
      // Calculate the length of the line based on the animation time of the path
      const lineLength = (path.time / totalAnimTime) * CANVAS_WIDTH;
      const x2 = new Animated.Value(startX);
      // Create the animation for the line
      const animation = Animated.timing(x2, {
        toValue: startX + lineLength,
        duration: path.time / animationParams.speed, // later path should have its own speed value
        useNativeDriver: true,
      });

      // Add the animation to the array
      animationsX2.push(animation);
      newAllLines.push({index, x1: startX, color: path.stroke || MY_BLACK});
      // Update the starting point for the next line
      startX += lineLength;
      newAnimatedValues.push(x2);
    });

    setAllLines(newAllLines);
    setAnimatedX2Values(newAnimatedValues);
    animationX2Ref.current = Animated.sequence(animationsX2);
  };

  useEffect(() => {
    // console.log('animation track bar updated')
    reset();
    createAnimation();
  },[myPathData, animationParams]);


  const play = () => {
    if (!animationX2Ref.current) {
      createAnimation();
    }
    if(animationX2Ref.current) {
      animationX2Ref?.current?.start();
    }
  };

  const reset = () => {
    if (animationX2Ref.current) {
      animationX2Ref?.current?.stop();
      animationX2Ref?.current?.reset();
    }
  }

  const stop = () => {
    if (animationX2Ref.current) {
      animationX2Ref?.current?.stop();
    }
  };

  React.useImperativeHandle(ref, () => ({
    play,
    stop,
    reset,
  }
  ));

  return (
    <Svg height="5" width={CANVAS_WIDTH}>
      {animatedX2Values.map((animatedValue, index) => {
        const currentLine = allLines[index];

        if(currentLine) {
        // Create the line
        const line = (
          <AnimatedLine
            key={currentLine.index}
            x1={currentLine.x1.toString()}
            y1="0"
            x2={animatedValue}
            y2="0"
            stroke={currentLine.color}
            strokeWidth="4"
          />
        );
        return line;
      }
      return null;
      })}
    </Svg>
  );
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


  const previewRef = useRef<SvgAnimateHandle | null>(null);
  const trackRef = useRef<AnimationTrackBarInterface | null>(null);


  useEffect(() => {
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
      <View style={{ width: CANVAS_WIDTH, height: 5, zIndex: 999}}>
      <AnimationTrackBar ref={trackRef} myPathData={myPathData} animationParams={animationParams} />
      </View>
      <SvgAnimate
        ref={previewRef}
        myPathData={myPathData}
        onLoopBegin={() => {
          // myConsole.log('loop begin');
          trackRef?.current?.play();

        }}

        onLoopEnd={() => {
          // myConsole.log('loop end');
          trackRef?.current?.reset();
        }}


        // how to distinguish stopped or paused??
        onLoopStopped={() => {
          // myConsole.log('loop stopped');
          trackRef?.current?.reset();
        }}

        />
    </View>
  );
};

export default PreviewScreen;
