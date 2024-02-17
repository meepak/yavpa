import { View, Text } from "react-native";
import MySlider from "@c/controls/my-slider";
import Svg, { Line } from "react-native-svg";
import { useEffect, useState } from "react";
import StrokeWidth from "./stroke-width";
import StrokeOpacity from "./stroke-opacity";
import Divider from "./divider";

const StrokeWidthOpacity = ({ color, width, opacity, onWidthChanged, onOpacityChanged }) => {
  return (
    <><View style={{ position: 'absolute', top: 7, zIndex: -2, margin: 5 }}>
      <StrokeWidth color={color} opacity={opacity} value={width} onValueChanged={onWidthChanged} />
    </View>
    <View style={{ position: 'absolute', top: 77, zIndex: -2, margin: 5 }}>
        <Divider width={1} color={color} />
        <StrokeOpacity color={color} strokeWidth={width} value={opacity} onValueChanged={onOpacityChanged} />
      </View></>
  )
}

export default StrokeWidthOpacity