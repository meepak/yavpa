import React, { } from "react";
import {
  MyColorPicker,
  StrokeWidth, 
  StrokeOpacity,
  SimplifySmooth, 
  PathsAsLayers, 
  SelectShape
} from "component/controls"
import { ColorValue } from "react-native";
import SelectBrush from "@c/controls/select-brush";
import StrokeWidthOpacity from "@c/controls/stroke-width-opacity";
import SelectBrushColor from "@c/controls/select-brush-color";

const createDrawControls = ({
  // onLock,
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
  // onSelectMode,
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
        onValueChanged={(color) => setStroke(() => color)}
        />
      ),
      extraPanel: { width: 340, height: 360 }
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
      key: "stroke-width-opacity",
      icon: "stroke-width",
      title: "Set Stroke Width & Opacity",
      extraControl: (
        <StrokeWidthOpacity
          color={stroke}
          opacity={strokeOpacity}
          width={strokeWidth}
          onOpacityChanged={(value: number) => {
            setStrokeOpacity(() => value);
          }}
          onWidthChanged={(value: number) => {
            setStrokeWidth(() => value);
          }}
        />
      ),
      extraPanel: { width: 320, height: 200 }
    },
    {
      key: "line-simplify",
      icon: "line-simplify",
      title: "Simplify & Smooth",
      extraControl: (
        <SimplifySmooth
          color={stroke}
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
      extraPanel: { width: 285, height: 240 }
    }, 
    {
      key: "erasure",
      icon: "erasure-off",
      toggleIcons: ["erasure", "erasure-off"],
      onPress: toggleErasure,
    },

    // {
    //   key: "select",
    //   icon: "select",
    //   onPress: onSelectMode,
    // },
    {
      key: "layers",
      icon: "layers",
      title: "Layers",
      extraControl: (
        <PathsAsLayers />
      ),
      extraPanel: { width: 330, height: 'auto'}
    },
  ])};

export default createDrawControls