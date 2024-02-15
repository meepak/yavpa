import AnimationParams from "@c/controls/animation-params";
import React from "react";

const createPreviewControls = ({
  onPreviewPlay,
  onPreviewStop,
  speed,
  setSpeed,
  loop,
  setLoop,
  delay,
  setDelay
}) => [
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
      title: "Set Animation Params",
      extraControl: (
        <AnimationParams
          speed={speed}
          onSpeedChanged={(value: number) => {
            setSpeed(() => value);
          }}
          loopStatus={loop}
          onLoopStatusChanged={(value: boolean) => {
            setLoop(() => value);
          }}
          loopDelay={delay}
          onLoopDelayChanged={(value: number) => {
            setDelay(() => value);
          }}
        />
      ),
      extraPanel: { width: 250, height: 210 }
    },
  ];

export default createPreviewControls;