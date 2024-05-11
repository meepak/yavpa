import React, { useContext, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import {
  type AnimationParamsType,
  CANVAS_WIDTH,
  type SvgAnimateHandle,
  PathDataType,
  MyPathDataContextType,
  MyPathDataType,
} from "@u/types";
import { useMyPathDataContext } from "@x/svg-data";
import SvgAnimate from "./animate";
import createPreviewControls from "./control";
import { type AnimationTrackBarInterface, AnimationTrackBar } from "./trackbar";

const PreviewScreen = ({ initControls, onPathClippedByBbox }) => {
  const { myPathData, setMyPathData } = useMyPathDataContext();
  const [clippedMyPathData, setClippedMyPathData] = useState<MyPathDataType>(myPathData);
  const [animationParameters, setAnimationParameters] =
    useState<AnimationParamsType>({
      speed: myPathData.metaData.animation?.speed || 1,
      loop: myPathData.metaData.animation?.loop || true,
      delay: myPathData.metaData.animation?.delay || 0,
      transition: myPathData.metaData.animation?.transition || 0,
      transitionType: myPathData.metaData.animation?.transitionType || 0,
      correction: myPathData.metaData.animation?.correction || 0.05,
    });

  const previewReference = useRef<SvgAnimateHandle | undefined>(null);
  const trackReference = useRef<AnimationTrackBarInterface | undefined>(null);

  useEffect(
    () =>
      // On leaving clear the controls
      () =>
        initControls([]),
    [],
  );

  useEffect(() => {
    if (previewReference.current) {
      previewReference.current.saveAnimationParams(animationParameters);
    }

    if (
      myPathData.metaData.animation &&
      JSON.stringify(myPathData.metaData.animation) !==
        JSON.stringify(animationParameters)
    ) {
      // MyConsole.log('animation params updated, should trigger saving to file');
      setMyPathData((previous) => ({
        ...previous,
        metaData: {
          ...previous.metaData,
          animation: animationParameters,
          updatedAt: "",
        },
      }));
    }

    initControls(buttons);
  }, [animationParameters]);

  const handleOnClipped = (clippedPaths: PathDataType[]) => {
	setClippedMyPathData({
	  ...myPathData,
	  pathData: clippedPaths,
	});
    const totalTime = clippedPaths.reduce(
      (accumulator, path) => accumulator + path.time,
      0,
    );
    const totalPaths = clippedPaths.length;
    onPathClippedByBbox && onPathClippedByBbox(totalPaths, totalTime);
  };

  const onPreviewPlay = () => {
    if (previewReference.current) {
      previewReference.current.playAnimation();
    }
  };

  const onPreviewStop = () => {
    if (previewReference.current) {
      previewReference.current.stopAnimation();
    }
  };

  // In your component:
  const buttons = createPreviewControls({
    onPreviewPlay,
    onPreviewStop,
    animationParams: animationParameters,
    setAnimationParams: setAnimationParameters,
  });

  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
      <View style={{ width: CANVAS_WIDTH, height: 5, zIndex: 999 }}>
        <AnimationTrackBar
          ref={trackReference}
          myPathData={clippedMyPathData}
          animationParams={animationParameters}
        />
      </View>
      <SvgAnimate
        ref={previewReference}
        myPathData={myPathData}
        onClipped={handleOnClipped}
        clipByBbox={true}
        onLoopBegin={() => {
          // MyConsole.log('loop begin');
          trackReference?.current?.play();
        }}
        onLoopEnd={() => {
          // MyConsole.log('loop end');
          trackReference?.current?.reset();
        }}
        // How to distinguish stopped or paused??
        onLoopStopped={() => {
          // MyConsole.log('loop stopped');
          trackReference?.current?.reset();
        }}
      />
    </View>
  );
};

export default PreviewScreen;
