import React, { } from "react";
import ColorBox from "@/components/color-box";
import StrokeWidth from "@/components/stroke-width";
import SimplifySmooth from "@/components/simplify-smooth";

const createDrawControls = ({
  showFilesModal,
  onNewPress,
  onUndo,
  onRedo,
  strokeWidth,
  setStrokeWidth,
  stroke,
  setStroke,
  simplifyTolerance,
  setSimplifyTolerance,
  d3CurveBasis,
  setD3CurveBasis,
  showPreviewModal,
}) => [
    {
      icon: "folder-open",
      onPress: showFilesModal,
    },
    {
      icon: "file-present",
      onPress: onNewPress,
    },
    {
      icon: "undo",
      onPress: onUndo,
    },
    {
      icon: "redo",
      onPress: onRedo,
    },
    {
      icon: "palette",
      title: "Select Stroke Color",
      extraControl: (
        <ColorBox
          initialColor={stroke}
          onColorSelected={(color) => setStroke(color)}
        />
      ),
      extraPanel: { width: 350, height: 230 }
    },
    {
      icon: "line-weight",
      title: "Set Stroke Width",
      extraControl: (
        <StrokeWidth
          color={stroke}
          value={strokeWidth}
          onValueChanged={(value) => {
            setStrokeWidth(() => value);
          }}
        />
      ),
      extraPanel: { width: 250, height: 100 }
    },
    {
      icon: "insights",
      title: "Simplify & Smooth",
      extraControl: (
        <SimplifySmooth
          color={stroke}
          simplifyValue={simplifyTolerance}
          onSimplifyValueChanged={(value) => {
            setSimplifyTolerance(() => value);
          }}
          d3Value={d3CurveBasis}
          onD3ValueChanged={(value) => {
            setD3CurveBasis(() => value);
          }}
        />
      ),
      extraPanel: { width: 250, height: 200 }
    },
    // {
    //   icon: "rounded-corner",
    //   title: "D3 Curve Basis",
    //   extraControl: (
    //     <SmoothControl
    //       value={d3CurveBasis}
    //       onValueChanged={(value) => {
    //         setD3CurveBasis(() => value);
    //       }}
    //     />
    //   ),
    // },
    {
      icon: "preview",
      onPress: showPreviewModal,
    },
  ];

export default createDrawControls