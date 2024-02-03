import React, { } from "react";
import ColorBox from "@cc/color-box";
import StrokeWidth from "@cc/stroke-width";
import SimplifySmooth from "@cc/simplify-smooth";
import PathsAsLayers from "../paths-as-layers";

const createDrawControls = ({
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
  svgData,
  updateSvgData,
  showPreviewModal,
}) => [
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
    {
      icon: "layers",
      title: "Layers",
      extraControl: (
        <PathsAsLayers
          value={svgData.pathData}
          onValueChanged={(value) => {
            updateSvgData(value);
          }}
        />
      ),
      extraPanel: { width: 330, height: (svgData.pathData.length + 2.5) * 32 }
    },
    {
      icon: "preview",
      onPress: showPreviewModal,
    },
  ];

export default createDrawControls