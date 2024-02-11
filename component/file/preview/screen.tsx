import React, { useState, useEffect, useRef, useContext } from "react";
import { View } from "react-native";
import { SvgDataContext } from "@x/svg-data";
import SvgAnimate, { SvgAnimateHandle } from "./animate";
import createPreviewControls from "./control";

const PreviewScreen = ({ initControls }) => {
  const [speed, setSpeed] = useState(1);
  const { svgData } = useContext(SvgDataContext);
  const previewRef = useRef<SvgAnimateHandle | null>(null);

  const onPreviewLoop = () => {
    if (previewRef.current) {
      previewRef.current.loopAnimation();
    }
  }
  const onPreviewReplay = () => {
    if (previewRef.current) {
      previewRef.current.replayAnimation();
    }
  }
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
  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.animationSpeed(speed);
    }
  }, [speed]);


  useEffect(() => {
    onPreviewPlay();
  }, [previewRef]);


  // In your component:
  const buttons = createPreviewControls({
    onPreviewLoop,
    onPreviewPlay,
    onPreviewStop,
    speed,
    setSpeed,
  });

  useEffect(() => {
    initControls(buttons)
  }, [speed])


  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
      <SvgAnimate ref={previewRef} svgData={svgData} />
    </View>
  );
};

export default PreviewScreen;
