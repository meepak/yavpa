import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';


// TODO find matching gradient colors, darker at first and pastel at the end as regular background
export const AnimatedColorOptions = {
  splash: {
    duration: 500,
    inputRange: [0, 1, 2, 3, 4, 5],
    outputRange: ['#8f0fff', '#b57edc', '#cccfff', '#fae6fa', '#fff0f5', '#e6e6fa']
  },
  default: {
    duration: 7777,
    inputRange: [0, 1, 2, 3, 4, 5 ],
    outputRange: [ '#f0f8ff', '#f2f3f4', '#fff8e7', '#f8f8ff', '#f5fffa', '#f7f7f7']
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
    <Animated.View style={{...StyleSheet.absoluteFillObject, backgroundColor: interpolateColor}}>
      {children}
      </Animated.View>
  );
};

export default AnimatedColor;
