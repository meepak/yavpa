import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import SvgAnimate from "./animate";
import createPreviewControls from "./control";
import { AnimationParamsType, SvgAnimateHandle } from "@u/types";

const PreviewScreen = ({ zoom, svgData, setSvgData, initControls }) => {

  // const { svgData, setSvgData } = useContext(SvgDataContext);
  const [animationParams, setAnimationParams] = useState<AnimationParamsType>({
    speed: svgData.metaData.animations?.speed || 1,
    loop: svgData.metaData.animations?.loop || true,
    delay: svgData.metaData.animations?.delay || 0,
    transition: svgData.metaData.animations?.transition || 0,
    transitionType: svgData.metaData.animations?.transitionType || 1,
    correction: svgData.metaData.animations?.correction || 0.05,
  });

  const previewRef = useRef<SvgAnimateHandle | null>(null);


  useEffect(() => {
    setTimeout(
      onPreviewPlay, 500);
  }, []);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.setAnimationParams(animationParams);
    }
    if (svgData.metaData.animation && svgData.metaData.animation !== animationParams) {
      console.log('animation params updated, should trigger saving to file');
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
      <SvgAnimate ref={previewRef} svgData={svgData} zoom={zoom} />
    </View>
  );
};

export default PreviewScreen;
