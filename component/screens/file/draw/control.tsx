import React, { } from "react";
import {
  SimplifySmooth,
  PathsAsLayers,
  SelectShape,
  StrokeWidth,
  StrokeOpacity
} from "component/controls"
import SelectBrushColor from "@c/controls/select-brush-color";

const createDrawControls = ({
  // onLock,
  svgData,
  setSvgData,
  onUndo,
  onRedo,
  strokeWidth,
  setStrokeWidth,
  stroke,
  setStroke,
  strokeOpacity,
  setStrokeOpacity,
  simplifyTolerance,
  setSimplifyTolerance,
  d3CurveBasis,
  setD3CurveBasis,
  shape,
  drawShape,
  toggleErasure,
}) => {
  // console.log('createDrawControls', strokeWidth);
  return ([
    {
      key: "undo",
      icon: "undo",
      onPress: onUndo,
    },
    {
      key: "redo",
      icon: "redo",
      onPress: onRedo,
    },
    {
      key: "palette",
      icon: "palette",
      title: "Select Stroke Color",
      extraControl: (
        <SelectBrushColor
        value={stroke}
        onValueChanged={(color: string) => setStroke(() => color)}
        />
      ),
      extraPanel: { width: 140, height: 500 }
    },
    // {
    //   key: "brush",
    //   icon: "palette",
    //   title: "Select Brush Stroke",
    //   extraControl: (
    //     <SelectBrush
    //       value={stroke.startsWith('url(#') ? stroke.slice(5, -1) : ''}
    //       onValueChanged={(guid: string) => setStroke(() => "url(#" + guid + ")")}
    //     />
    //   ),
    //   extraPanel: { width: 280, height: 320 }
    // },
    {
      key: "stroke-width",
      icon: "stroke-width",
      title: "Set Stroke Width",
      extraControl: (
        <StrokeWidth
          stroke={stroke}
          strokeOpacity={strokeOpacity}
          value={strokeWidth}
          onValueChanged={(value: number) => {
            setStrokeWidth(() => value);
          }}
        />
      ),
      extraPanel: { width: 100, height: 400 }
    },
    {
      key: "stroke-opacity",
      icon: "opacity",
      title: "Set Stroke Opacity",
      extraControl: (
        <StrokeOpacity
          stroke={stroke}
          strokeWidth={strokeWidth}
          value={strokeOpacity}
          onValueChanged={(value: number) => {
            setStrokeOpacity(() => value);
          }}
        />
      ),
      extraPanel: { width: 100, height: 400 }
    },
    {
      key: "line-simplify",
      icon: "line-simplify",
      title: "Simplify & Smooth",
      extraControl: (
        <SimplifySmooth
          simplifyValue={simplifyTolerance}
          onSimplifyValueChanged={(value: number) => {
            setSimplifyTolerance(() => value);
          }}
          d3Value={d3CurveBasis}
          onD3ValueChanged={(value: string) => {
            setD3CurveBasis(() => value);
          }}
        />
      ),
      extraPanel: { width: 300, height: 300 }
    },
    {
      key: "shapes",
      icon: "shapes",
      title: "Draw Shape",
      extraControl: (
        <SelectShape onValueChanged={(value: string) => { drawShape(value); }} value={shape} />
      ),
      extraPanel: { width: 150, height: 400 }
    },
    {
      key: "erasure",
      icon: "erasure-off",
      toggleIcons: ["erasure", "erasure-off"],
      onPress: toggleErasure,
    },
    {
      key: "layers",
      icon: "layers",
      title: "Layers",
      extraControl: (
        <PathsAsLayers svgData={svgData} setSvgData={setSvgData}/>
      ),
      extraPanel: { width: 200, height: 'auto'}
    },
  ])};

export default createDrawControls
