import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';


// TODO find matching gradient colors, darker at first and pastel at the end as regular background
export const AnimatedColorOptions = {
  splash: {
    duration: 500,
    inputRange: [0, 1, 2],
    outputRange: ['#4e164d', '#6f164d', '#7c517c'] //'#21164d', '#39164d', 
  },
  default: {
    duration: 4000,
    inputRange: [0, 1, 2, 3, 4, 5 ,6],
    outputRange: ['#D1C4E9', '#E1BEE7', '#F8BBD0', '#FFCDD2', '#C8E6C9', '#B3E5FC', '#BBDEFB']
  }
}

const AnimatedColor = ({option=AnimatedColorOptions.default, children}) => {
  const animation = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: option.duration,
          useNativeDriver: true
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration:  option.duration,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  /*
  '#B3E5FC', '#D7CCFF', '#FFD1DC', '#BBEEDD', '#FFE9D1'
  */

  const interpolateColor = animation.interpolate({
    inputRange: option.inputRange,
    outputRange: option.outputRange
  });


  return (
    <Animated.View style={{...StyleSheet.absoluteFillObject, backgroundColor: interpolateColor}}>{children}</Animated.View>
  );
};

export default AnimatedColor;
