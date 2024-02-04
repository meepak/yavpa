import React, { useState, useEffect, useRef, useContext } from "react";
import { View } from "react-native";
import SvgPreview from "@c/svg/preview";
import createPreviewControls from "@c/controls/page-controls/preview";
import { SvgDataContext } from "./context";
// import ExportScreen from "@a/svg/export";

const PreviewScreen = ({ initControls }) => {
  const {svgData} = useContext(SvgDataContext);
  const previewRef = useRef(null);
  const [speed, setSpeed] = useState(1);

  const onPreviewLoop = () => previewRef?.current?.loopAnimation(); // this doesn't work
  const onPreviewReplay = () => previewRef?.current?.replayAnimation();
  const onPreviewPlay = () => previewRef?.current?.playAnimation();
  const onPreviewStop = () => previewRef?.current?.stopAnimation();
  const speedChange = (factor) => {
    previewRef?.current?.animationSpeed(speed / factor);
    setSpeed((speed) => speed / factor);
  };

  useEffect(() => {
    onPreviewPlay();
  }, [previewRef]);

  // In your component:
  const buttons = createPreviewControls({
    onPreviewLoop,
    onPreviewReplay,
    onPreviewStop,
    speed,
    speedChange,
  });

  return (
      <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
          <SvgPreview ref={previewRef} svgData={svgData} />
      </View>
  );
};

export default PreviewScreen;
