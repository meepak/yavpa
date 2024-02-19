import { SvgDataContext } from "@x/svg-data";
import React, { useContext, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import SvgAnimate from "./animate";
import createPreviewControls from "./control";
import { saveSvgToFile } from "@u/storage";
import { SvgAnimateHandle } from "@u/types";

const PreviewScreen = ({ initControls }) => {
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(true);
  const [delay, setDelay] = useState(0);
  const [correction, setCorrection] = useState(0.05);

  const { svgData, setSvgData } = useContext(SvgDataContext);
  const previewRef = useRef<SvgAnimateHandle | null>(null);

  useEffect(() => 
  {
    const animationData = svgData.metaData.animation;
    if(animationData) {
      setSpeed(animationData.speed || 1);
      setLoop(animationData.loop || true);
      setDelay(animationData.delay || 0)
      setCorrection(animationData.correction || 0.05)
    }
  }, [])

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
    if (previewRef.current) {
      previewRef.current.animationLoop(loop);
    }
  }, [loop]);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.animationDelay(delay);
    }
  }, [delay]);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.animationCleanup(correction);
    }
  }, [correction]);

  useEffect(() => {
    setTimeout(
    onPreviewPlay, 500);
  }, []);


  // In your component:
  const buttons = createPreviewControls({
    onPreviewPlay,
    onPreviewStop,
    speed,
    setSpeed,
    loop,
    setLoop,
    delay,
    setDelay,
    correction,
    setCorrection,
  });

  useEffect(() => {
    svgData.metaData.animation = {speed, loop, delay, correction}
    setSvgData(svgData)
    // throttle saving to file
    saveSvgToFile(svgData); // TODO  lets do this way in draw screen too, save where its needed not on every change
    initControls(buttons)
  }, [speed, loop, delay, correction])


  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
      <SvgAnimate ref={previewRef} svgData={svgData}/>
    </View>
  );
};

export default PreviewScreen;
