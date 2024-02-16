import React from 'react';
import { Defs, LinearGradient, Pattern, RadialGradient, Stop, Image } from 'react-native-svg';
import { BrushType, GradientBrushPropType, PatternBrushPropType } from './types';

export const LinearGradientBrush = 
({ guid, colors }: GradientBrushPropType) => (
  <Defs key={guid}>
    <LinearGradient gradientUnits="objectBoundingBox" id={guid} x1="0%" y1="0%" x2="100%" y2="0%">
      {colors.map((color, index) => (
        <Stop
          key={index}
          offset={`${(index / (colors.length - 1)) * 100}%`}
          stopColor={color}
          stopOpacity="1"
        />
      ))}
    </LinearGradient>
  </Defs>
);

//  rx="50%" ry="50%" fx="50%" fy="50%">
export const RadialGradientBrush = 
({ guid, colors }: { guid: string, colors: string[] }) => (
  <Defs key={guid}>
    <RadialGradient gradientUnits="userSpaceOnUse" id={guid} cx="0.5" cy="0.5" r="0.5">
      {colors.map((color, index) => (
        <Stop
          key={index}
          offset={`${(index / (colors.length - 1)) * 100}%`}
          stopColor={color}
          stopOpacity="1"
        />
      ))}
    </RadialGradient>
  </Defs>
);

export const PatternBrush = ({guid, pattern}: PatternBrushPropType) => (
  <Defs key={guid}>
    <Pattern id={guid} patternUnits="userSpaceOnUse" x="0" y="0" width="50" height="50">
      <Image href={pattern} x="0" y="0" width="200" height="200" />
    </Pattern>
  </Defs>
);

export const getBrush = (brush: BrushType) => {
  switch (brush.name) {
    case "LinearGradientBrush":
        return LinearGradientBrush({
          guid: brush.params.guid, 
          colors: (brush.params as GradientBrushPropType).colors
        });
    case "RadialGradientBrush":
      return RadialGradientBrush({
        guid: brush.params.guid, 
        colors: (brush.params as GradientBrushPropType).colors
      });
    case "PatternBrush":
      return PatternBrush({
        guid: brush.params.guid, 
        pattern: (brush.params as PatternBrushPropType).pattern
      });
    default:
      return null;
  }
}

export const Brushes: BrushType[] = [
  {
    name: "LinearGradientBrush",
    params: {guid: "my-brush-1", colors: ["rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)"]}
  },
  {
    name: "LinearGradientBrush",
    params: {
      guid: "my-iridiscent-brush-2",
      colors: [
              "rgb(255,0,0)", 
              "rgb(255,165,0)", 
              "rgb(255,255,0)", 
              "rgb(0,128,0)", 
              "rgb(0,0,255)", 
              "rgb(75,0,130)", 
              "rgb(238,130,238)"
            ]
    }
  },
  {
    name: "LinearGradientBrush",
    params: {  guid: "my-brush-3", colors: ["rgba(105,105,105,1)", "rgba(169,169,169,0.5)", "rgba(192,192,192,1)", "rgba(169,169,169,0.5)", "rgba(105,105,105,1)"] }
  },
  {
   
    name: "LinearGradientBrush",
    params: { guid: "my-brush-4", colors: ["rgba(112,128,144,1)", "rgba(192,192,192,0.5)", "rgba(112,128,144,1)"] }
  },
  {
    name: "PatternBrush",
    params: { guid: "my-brush-5", pattern: require("@a/pattern/1.jpg")}
  },
  {
    name: "PatternBrush",
    params: { guid: "my-brush-6", pattern: require("@a/pattern/2.jpg")}
  },
  {
    name: "PatternBrush",
    params: { guid: "my-brush-7", pattern: require("@a/pattern/3.jpg")}
  },
  {
    name: "PatternBrush",
    params: { guid: "my-brush-8", pattern: require("@a/pattern/4.jpg")}
  },
  {
    name: "RadialGradientBrush",
    params: {guid: "my-brush-9", colors: ["rgb(255,0,0)", "rgb(0,255,0)"]}
  },
  // {
  //   name: "RadialGradientBrush",
  //   params: {guid: "my-brush-2", colors: ["rgb(255,0,0)", "rgb(0,0,255)"] }
  // },
  // {
  //   name: "RadialGradientBrush",
  //   params: {guid: "my-brush-5", colors: ["rgba(105,105,105,1)", "rgba(169,169,169,0.5)", "rgba(192,192,192,1)", "rgba(169,169,169,0.5)", "rgba(105,105,105,1)"] }
  // },
  // {
  //   name: "RadialGradientBrush",
  //   params: {guid: "my-brush-7", colors: ["rgba(112,128,144,1)", "rgba(192,192,192,0.5)", "rgba(112,128,144,1)"] }
  // }
  
]