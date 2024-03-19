import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import Slider, { SliderProps } from "@react-native-community/slider";
import { debounce } from 'lodash';
import MyIcon from "./my-icon";
import { MY_BLACK } from "@u/types";
import { precise } from "@u/helper";

interface MySliderProps extends SliderProps {
  name: string;
  suffix?: string;
  horizontal?: boolean;
  plusMinusButtons?: boolean;
}

const MySlider = (props: MySliderProps) => {
  const [value, setValue] = useState(props.value);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
    console.log('value is et', value)
  }, [value]);

  const showIconButton = props.plusMinusButtons !== false;


  const processValueChange = (newValue: number) => {
    setValue(newValue);
    // valueRef.current = newValue;
    if (props.onValueChange) {
      props.onValueChange(newValue);
    }
  }

  const handleValueChange = (delta: number) => {
    processValueChange((valueRef.current ?? 1) + delta);
  };

  return (
    <><View style={{
      width: !props.horizontal ? 330 : 270,
      ...(!props.horizontal && {
        transform: [
          { translateX: -135 },
          { rotate: "-90deg" },
          { translateX: -150 }
        ],
      }),
      alignContent: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ fontWeight: 'bold', alignSelf: 'center' }}>{props.name}</Text>
      <Slider
        {...props}
        tapToSeek={true}
        value={value}
        thumbImage={require("@a/slider-cap.png")}
        maximumTrackTintColor="#00FFFF"
        minimumTrackTintColor={MY_BLACK}
        onValueChange={processValueChange} />
      <Text style={{ fontWeight: 'bold', alignSelf: 'center' }}>{precise(value as any)}{props.suffix || ""}</Text>
    </View>

      {showIconButton &&
        <>
          <View style={{
            position: 'absolute',
            bottom: !props.horizontal ? -20 : -10,
            left: !props.horizontal ? -10 : 5,
            width: 30,
            height: 30,
          }}>
            <MyIcon
              name="minus-circle"
              size={28}
              fill={MY_BLACK}
              strokeWidth={0.5}
              // onPress={() => debouncedChange((value ?? 0) - 1)}
              // onPressIn={() => startInterval(-1 * (props.step || 1))}
              onPressOut={() => handleValueChange(-1 * (props.step || 1))}
              color={MY_BLACK}
            />
          </View>

          <View style={{
            position: 'absolute',
            bottom: !props.horizontal ? -20 : -10,
            right: !props.horizontal ? -30 : 0,
            width: 30,
            height: 30,

          }}>
            <MyIcon
              name="plus-circle"
              size={28}
              fill={MY_BLACK}
              strokeWidth={0.5}
              // onPress={() => debouncedChange((value  ?? 0) + 1)}
              // onPressIn={() => startInterval(1 * (props.step || 1))}
              onPressOut={() => handleValueChange(1 * (props.step || 1))}
              color={MY_BLACK}

            />
          </View></>
      }
    </>
  );
};

export default MySlider;
