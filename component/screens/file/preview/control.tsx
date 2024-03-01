import AnimationParams from "@c/controls/animation-params";
import DashOffsetCorrection from "@c/controls/dash-offset-correction";
import { AnimationParamsType } from "@u/types";
import React from "react";

const createPreviewControls = ({
  onPreviewPlay,
  onPreviewStop,
  animationParams,
  setAnimationParams
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
          animationParams={animationParams}
          onAnimationParamsChanged={(value: AnimationParamsType) => {
            setAnimationParams((prev: AnimationParamsType) => ({ 
              ...prev, 
              speed: value.speed,
              loop: value.loop,
              delay: value.delay,
              transition: value.transition,
            }));
          }}
        />
      ),
      extraPanel: { width: 310, height: 220 }
    },
    {
      key: "erasure",
      icon: "erasure",
      title: "Clear fragments",
      extraControl: (
        <DashOffsetCorrection
          value={animationParams.correction}
          onValueChanged={(value: number) => {
            setAnimationParams((prev: AnimationParamsType) => ({...prev, correction: value}));
          }}
          />
      ),
      extraPanel: { width: 250, height: 140 }
    },
  ];

export default createPreviewControls;