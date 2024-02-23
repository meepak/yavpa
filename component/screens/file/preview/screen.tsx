import { SvgDataContext } from "@x/svg-data";
import React, { useContext, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import SvgAnimate from "./animate";
import createPreviewControls from "./control";
// import { saveSvgToFile } from "@u/storage";
import { AnimationParamsType, SvgAnimateHandle } from "@u/types";
import { saveSvgToFile } from "@u/storage";

const PreviewScreen = ({ initControls }) => {

  const { svgData, setSvgData } = useContext(SvgDataContext);
  const [animationParams, setAnimationParams] = useState<AnimationParamsType>({
    speed: 1,
    loop: true,
    delay: 0,
    correction: 0.05,
  });

  // const [speed, setSpeed] = useState(1);
  // const [loop, setLoop] = useState(true);
  // const [delay, setDelay] = useState(0);
  // const [correction, setCorrection] = useState(0.05);

  const previewRef = useRef<SvgAnimateHandle | null>(null);


  useEffect(() => {
    setTimeout(
      onPreviewPlay, 500);
  }, []);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.setAnimationParams(animationParams);
    }
    console.log('animation params updated, should trigger saving to file');
    svgData.metaData.animation = animationParams;
    setSvgData((prev) => ({...prev, metaData: { ...prev.metaData, animation: animationParams}}));
    // throttle saving to file
    // saveSvgToFile(svgData); // TODO  lets do this way in draw screen too, save where its needed not on every change
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



  // useEffect(() => {
  //   if (previewRef.current) {
  //     previewRef.current.animationLoop(loop);
  //   }
  // }, [loop]);

  // useEffect(() => {
  //   if (previewRef.current) {
  //     previewRef.current.animationDelay(delay);
  //   }
  // }, [delay]);

  // useEffect(() => {
  //   if (previewRef.current) {
  //     previewRef.current.animationCleanup(correction);
  //   }
  // }, [correction]);


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
