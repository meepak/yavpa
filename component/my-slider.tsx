import React, { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import Slider, { SliderProps } from "@react-native-community/slider";
import { debounce } from 'lodash';
import MyIcon from "./my-icon";

interface MySliderProps extends SliderProps {
  name: string;
  suffix?: string;
  horizontal?: boolean;
  plusMinusButtons?: boolean;
}

const MySlider = (props: MySliderProps) => {
  const [value, setValue] = useState(props.value);
  const valueRef = useRef(value);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const precision = props.step?.toString().split(".")[1]?.length || 0;

  const showIconButton = props.plusMinusButtons !== false;
  const debouncedChange = debounce((newValue) => {
    processValueChange(newValue);
  }, 100);

  const processValueChange = (newValue: number) => {
    props.minimumValue = props.minimumValue || 1;
    props.maximumValue = props.maximumValue || 100;
    newValue = newValue < props.minimumValue ? props.minimumValue : newValue;
    newValue = newValue > props.maximumValue ? props.maximumValue : newValue;
    newValue = Number(newValue.toFixed(precision));
    setValue(newValue);
    valueRef.current = newValue;
    if (props.onValueChange) {
      props.onValueChange(newValue);
    }
  }

  const handleValueChange = (delta: number) => {
    processValueChange((valueRef.current ?? 1) + delta);
  };

  // const startInterval = (delta: number) => {
  //   intervalRef.current = setInterval(() => {
  //     handleValueChange(delta);
  //   }, 100); // change slider value every 100ms
  // };

  // const stopInterval = () => {
  //   if (intervalRef.current) {
  //     clearInterval(intervalRef.current);
  //     intervalRef.current = null;
  //   }
  // };

  // useEffect(() => {
  //   return stopInterval; // stop interval when component unmounts
  // }, []);

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
        minimumTrackTintColor="#120e31"
        onValueChange={debouncedChange} />
      <Text style={{ fontWeight: 'bold', alignSelf: 'center' }}>{value}{props.suffix || ""}</Text>
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
              fill={'#120e31'}
              strokeWidth={0.5}
              // onPress={() => debouncedChange((value ?? 0) - 1)}
              // onPressIn={() => startInterval(-1 * (props.step || 1))}
              onPressOut={() => handleValueChange(-1 * (props.step || 1))}
              color={'#120e31'}
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
              fill={'#120e31'}
              strokeWidth={0.5}
              // onPress={() => debouncedChange((value  ?? 0) + 1)}
              // onPressIn={() => startInterval(1 * (props.step || 1))}
              onPressOut={() => handleValueChange(1 * (props.step || 1))}
              color={'#120e31'}

            />
          </View></>
      }
    </>
  );
};

export default MySlider;
