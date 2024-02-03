import React, { useEffect, useState } from 'react';
import { Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedBg = () => {
  const [animation, setAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: false
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: false
        })
      ])
    ).start();
  }, []);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  const interpolateColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 223, 238, 1)', 'rgba(203, 241, 255, 1)'] // Example pastel colors
  });

  return (
    <Animated.View style={{ flex: 1 }}>
      <LinearGradient
        colors={[interpolateColor, 'rgba(255, 255, 255, 0.8)']} // Gradient effect
        style={{ width: screenWidth, height: screenHeight }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

export default AnimatedBg;
