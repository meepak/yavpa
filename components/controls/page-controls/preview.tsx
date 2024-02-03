import React, {  } from "react";
import MySlider from "@c/controls/slider"; 

const createPreviewControls = ({
  onPreviewLoop,
  onPreviewReplay,
  onPreviewStop,
  speed,
  speedChange,
  setExportMode,
  closeMe,
}) => [
  {
    icon: "loop",
    onPress: onPreviewLoop,
  },
  {
    icon: "play-circle-outline",
    onPress: onPreviewReplay,
  },
  {
    icon: "stop",
    onPress: onPreviewStop,
  },
  {
    icon: "speed",
    title: "Set Animation Speed",
    extraControl: (
      <MySlider
        style={{ width: 250, height: 40 }}
        minimumValue={0.1}
        maximumValue={4}
        value={speed}
        onValueChange={speedChange}
      />
    ),
  },
  {
    icon: "code",
    onPress: () => setExportMode(true),
  },
  {
    icon: "close",
    onPress: closeMe,
  },
];

export default createPreviewControls;