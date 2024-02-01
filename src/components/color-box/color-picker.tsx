import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { ColorBoxProps } from "@/components/color-box/interface";


const colorMap = {
  "red": 1,
  "r": 1,
  "green": 3,
  "g": 3,
  "blue": 5,
  "b": 5
};

const getColor = (color: string, hexColorCode: string) => {
  let index: number;
  const colorKey = color.toLowerCase();
  if (colorMap.hasOwnProperty(colorKey)) {
    index = colorMap[colorKey];
  } else {
    console.log("Invalid color");
    return -1;
  }
  const c = parseInt(hexColorCode.substring(index, index + 2), 16);
  return isNaN(c) ? 0 : c;
}



const rgbToHex = (r: number, g: number, b: number) => {
  const hex =
    "#" +
    Math.round(r).toString(16).padStart(2, "0") +
    Math.round(g).toString(16).padStart(2, "0") +
    Math.round(b).toString(16).padStart(2, "0");
  return hex;
};

const getInverseColor = (R: number, G: number, B: number) => rgbToHex(255 - R, 255 - G, 255 - B);


const ColorPicker = ({ initialColor = '#000000', onColorSelected }: ColorBoxProps) => {
  const [color, setColor] = useState(initialColor);

  const [R, setR] = useState(() => getColor("R", initialColor));
  const [G, setG] = useState(() => getColor("G", initialColor));
  const [B, setB] = useState(() => getColor("B", initialColor));


  // this should help to sync back for initial color change
  useEffect(() => {
    const newR = getColor("R", initialColor);
    const newG = getColor("G", initialColor);
    const newB = getColor("B", initialColor);
  
    setColor(initialColor);
    setR(newR);
    setG(newG);
    setB(newB);
  }, [initialColor]);

  const updateColor = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    setColor(hex);
    if (onColorSelected) {
      onColorSelected(hex);
    }
  };

  return (
    <View style={{ width: '100%', height: '100%' }}>
      <View style={{ width: '100%', height: 20, backgroundColor: color }}>
        <Text style={{ color: getInverseColor(R, G, B), textAlign: "center" }}>
          {color}
        </Text>
      </View>
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={255}
        value={R}
        onValueChange={(value) => {
          setR(value);
          updateColor(value, G, B);
        }}
        maximumTrackTintColor={"red"}
        minimumTrackTintColor={"red"}
        thumbTintColor={"red"}
      />
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={255}
        value={G}
        onValueChange={(value) => {
          setG(value);
          updateColor(R, value, B);
        }}
        maximumTrackTintColor={"green"}
        minimumTrackTintColor={"green"}
        thumbTintColor={"green"}
      />
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={255}
        value={B}
        onValueChange={(value) => {
          setB(value);
          updateColor(R, G, value);
        }}
        maximumTrackTintColor={"blue"}
        minimumTrackTintColor={"blue"}
        thumbTintColor={"blue"}
      />
    </View>
  );
};

export default ColorPicker;
