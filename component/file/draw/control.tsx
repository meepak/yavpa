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
  // svgData, //get from context
  // updateSvgData,
  shape,
  drawShape,
  // onSelectMode,
}) => {
  // console.log('createDrawControls', strokeWidth);
  return ([
  // {
    // key: "unlock"
  //   icon: "unlock",
  //   toggleIcons: ["unlock", "lock"],
  //   onPress: onLock,
  // },
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
        <MyColorPicker
          initialColor={stroke}
          onColorSelected={(color: ColorValue) => setStroke(() => color)}
        />
      ),
      extraPanel: { width: 350, height: 320 }
    },
    {
      key: "brush",
      icon: "palette",
      title: "Select Brush Stroke",
      extraControl: (
        <SelectBrush
          value={stroke.startsWith('url(#') ? stroke.slice(5, -1) : ''}
          onValueChanged={(guid: string) => setStroke(() => "url(#" + guid + ")")}
        />
      ),
      extraPanel: { width: 280, height: 320 }
    },
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
      extraPanel: { width: 250, height: 200 }
    },
    // {
    //   key: "stroke-width",
    //   icon: "stroke-width",
    //   title: "Set Stroke Width",
    //   extraControl: (
    //     <StrokeWidth
    //       color={stroke}
    //       value={strokeWidth}
    //       onValueChanged={(value: number) => {
    //         setStrokeWidth(() => value);
    //       }}
    //     />
    //   ),
    //   extraPanel: { width: 250, height: 100 }
    // },
    // {
    //   key: "opacity",
    //   icon: "opacity",
    //   title: "Set Stroke Opacity",
    //   extraControl: (
    //     <StrokeOpacity
    //       color={stroke}
    //       strokeWidth={strokeWidth}
    //       value={strokeOpacity}
    //       onValueChanged={(value: number) => {
    //         setStrokeOpacity(() => value);
    //       }}
    //     />
    //   ),
    //   extraPanel: { width: 250, height: 100 }
    // },
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
      extraPanel: { width: 285, height: 180 }
    }, 

    // {
    //   key: "select",
    //   icon: "select",
    //   onPress: onSelectMode,
    // },
    // {
    //   key: "layers",
    //   icon: "layers",
    //   title: "Layers",
    //   extraControl: (
    //     <PathsAsLayers
    //       value={svgData.pathData}
    //       onValueChanged={(value) => {
    //         updateSvgData(value);
    //       }}
    //     />
    //   ),
    //   extraPanel: { width: 330, height: (svgData.pathData.length + 2.5) * 32 }
    // },
  ])};

export default createDrawControls