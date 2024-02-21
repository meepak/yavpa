import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Slider, { SliderProps } from "@react-native-community/slider";
import Svg, { Line, LineProps } from "react-native-svg";

interface MySliderProps extends SliderProps {
  name: string;
  width?: number;
  middleValue?: number; // value between minimumValue and maximumValue
  step1?: number; // step for the first half of the slider
  step2?: number; // step for the second half of the slider
}

const MySlider = (props: MySliderProps) => {
  const [value, setValue] = useState(props.value || 0);
  const [minValue, setMinValue] = useState(props.minimumValue || 0);
  const [maxValue, setMaxValue] = useState(props.maximumValue || 1);
  const [step, setStep] = useState(props.step1 || props.step || 0.01);

  useEffect(() => {
    if (!props.middleValue) return;

    if (value < props.middleValue) {
      setMinValue(props.minimumValue || 0);
      setMaxValue(props.middleValue + (props.step1 || props.step || 0.01)*5);
      setStep(props.step1 || props.step || 0.01);
      if (value > props.middleValue) {
        setValue(props.middleValue);
      }
    } else {
      setMinValue(props.middleValue - (props.step2 || props.step || 1)*5);
      setMaxValue(props.maximumValue || 1);
      setStep(props.step2 || props.step || 1);
      if (value < props.middleValue) {
        setValue(props.middleValue);
      }
    }
  }, [props.value, props.middleValue, props.step1, props.step2, props.step]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center"}}>
      <Text style={{fontWeight: 'bold'}}>{props.name}</Text>
      <Text>{value.toFixed(2)}</Text>
      <Slider
        {...props}
        style={{ width: props.width || 250, height: 30}}
        minimumValue={minValue}
        maximumValue={maxValue}
        step={step}
        value={value}
        onValueChange={(newValue) => {
          setValue(newValue);
          if (props.onValueChange) {
            props.onValueChange(newValue);
          }
        }}
      />
    </View>
  );
};

export default MySlider;

interface SliderPreviewProps extends LineProps {
  height: number;
  width: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export const SliderPreview = (props: SliderPreviewProps) => (
  <View 
    style={{ 
      height: props.height,
      width: props.width,
      position: 'absolute', 
      top: props.top || undefined,
      left: props.left || undefined,
      right: props.right || undefined,
      bottom: props.bottom || undefined,
      }}
    >
  <Svg 
    height={props.height} 
    width={props.width}
    >
    <Line
      x1={props.width > props.height ? props.width / 2 : 0}
      y1={props.height > props.width ? props.height / 2 : 0}
      x2={props.width}
      y2={props.height}
      stroke={props.stroke ?? '#000000'}
      {...props}
    />
  </Svg>
  </View>
)

