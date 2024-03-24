import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

const AnimatedColor = ({ children }) => {
  const animation = new Animated.Value(0);
    const AnimatedColorOptions = {
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

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: AnimatedColorOptions.duration,
          useNativeDriver: true
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: AnimatedColorOptions.duration,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  /*
  '#B3E5FC', '#D7CCFF', '#FFD1DC', '#BBEEDD', '#FFE9D1'
  */

  const interpolateColor = animation.interpolate({
    inputRange: AnimatedColorOptions.inputRange,
    outputRange: AnimatedColorOptions.outputRange
  });


  return (
    <Animated.View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: interpolateColor }}>
      {children}
    </Animated.View>
  );
};

export default AnimatedColor;
