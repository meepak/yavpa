import React, { } from "react";
import PlaySpeed from "@c/controls/play-speed";

const createPreviewControls = ({
  onPreviewLoop,
  onPreviewPlay,
  onPreviewStop,
  speed,
  setSpeed,
}) => [
    {
      key: "loop",
      icon: "loop",
      onPress: onPreviewLoop,
    },
    {
      key: "play",
      icon: "play",
      onPress: onPreviewPlay,
    },
    {
      key: "stop",
      icon: "stop",
      onPress: onPreviewStop,
    },
    {
      key: "speed",
      icon: "speed",
      title: "Set Animation Speed",
      extraControl: (
        <PlaySpeed
          value={speed}
          onValueChanged={(value: number) => {
            setSpeed(() => value);
          }}
        />
      ),
      extraPanel: { width: 250, height: 100 }
    },
  ];

export default createPreviewControls;