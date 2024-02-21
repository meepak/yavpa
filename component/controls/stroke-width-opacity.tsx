import { View, Text } from "react-native";
import MySlider from "@c/controls/my-slider";
import Svg, { Line } from "react-native-svg";
import { useEffect, useState } from "react";
// import StrokeWidth from "./stroke-width";
// import StrokeOpacity from "./stroke-opacity";
import Divider from "./divider";

const StrokeWidthOpacity = ({ color, width, opacity, onWidthChanged, onOpacityChanged }) => {
  return (
    <>
      <MySlider 
          name="Stroke Width" 
          value={width} 
          onValueChange={onWidthChanged} 
          minimumValue={1}
          maximumValue={100}
          middleValue={10}
          step1={0.1}
          step2={1}
      
      />
    </>
  )
}

export default StrokeWidthOpacity