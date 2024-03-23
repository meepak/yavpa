import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';


// TODO find matching gradient colors, darker at first and pastel at the end as regular background
export const AnimatedColorOptions = {
  splash: {
    duration: 1000,
    inputRange: [0, 1, 2, 3, 4],
    outputRange: ['#020935', '#020935DD', '#02093599', '#02093577', '#02093501']
  },
  default: {
    duration: 20000,
    inputRange: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    outputRange: [
      '#fde2e4CC',
      '#e2f0fdCC',
      '#e4fde2CC',
      '#f0f9f7CC',
      '#e2e4fdCC',
      '#f7f0f9CC',
      '#e0f2fdCC',
      '#fde4e2CC',
      '#f0f7f9CC',
      '#fde2f4CC'
    ]

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
