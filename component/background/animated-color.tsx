import React, { useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

const AnimatedColor = () => {
  const animation = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 15000,
          useNativeDriver: true
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 15000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);


  const interpolateColor = animation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['rgba(255, 223, 238, 1)', 'rgba(203, 241, 255, 1)', 'rgba(255, 223, 238, 1)']
  });


  return (
    <Animated.View style={{...StyleSheet.absoluteFillObject, backgroundColor: interpolateColor}} />
  );
};

export default AnimatedColor;
