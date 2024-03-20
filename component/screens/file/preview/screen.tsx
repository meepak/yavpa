import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import SvgAnimate from "./animate";
import createPreviewControls from "./control";
import { AnimationParamsType, SvgAnimateHandle } from "@u/types";
import myConsole from "@c/my-console-log";

const PreviewScreen = ({ svgData, setSvgData, initControls }) => {

  // const { svgData, setSvgData } = useContext(SvgDataContext);
  myConsole.log('svgdata animation params', svgData.metaData.animation)
  const [animationParams, setAnimationParams] = useState<AnimationParamsType>({
    speed: svgData.metaData.animation?.speed || 1,
    loop: svgData.metaData.animation?.loop || true,
    delay: svgData.metaData.animation?.delay || 0,
    transition: svgData.metaData.animation?.transition || 0,
    transitionType: svgData.metaData.animation?.transitionType || 1,
    correction: svgData.metaData.animation?.correction || 0.05,
  });
  myConsole.log('animationParams', animationParams);




  const previewRef = useRef<SvgAnimateHandle | null>(null);


  useEffect(() => {
    setTimeout(
      onPreviewPlay, 500
      );

    // on leaving clear the controls
    return () => initControls([]);
  }, []);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.setAnimationParams(animationParams);
    }
    if (svgData.metaData.animation && svgData.metaData.animation !== animationParams) {
      myConsole.log('animation params updated, should trigger saving to file');
      setSvgData((prev) => ({ ...prev, metaData: { ...prev.metaData, animation: animationParams, updatedAt: "" } }));
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
      <SvgAnimate ref={previewRef} svgData={svgData} />
    </View>
  );
};

export default PreviewScreen;
