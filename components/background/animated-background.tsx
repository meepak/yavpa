import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, ImageBackgroundProps, ImageStyle, Dimensions } from "react-native";

const AnimatedBackground: React.FC<ImageBackgroundProps> = (props) => {
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const zoom = useRef(new Animated.Value(1)).current;

  // Assuming the container is the full screen
  const containerWidth = Dimensions.get('window').width;
  const containerHeight = Dimensions.get('window').height;

  // Assuming the image dimensions are known
  const imageWidth = 1720; // Replace with your image width
  const imageHeight = 1024; // Replace with your image height

  // Calculate the maximum translation values
  const maxTranslateX = (imageWidth - containerWidth) / 2;
  const maxTranslateY = (imageHeight - containerHeight) / 2;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(pan, {
          toValue: { x: maxTranslateX * (Math.random() - 0.5), y: maxTranslateY * (Math.random() - 0.5) },
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(zoom, {
          toValue: 1 + Math.random() * 0.5, // Random zoom factor between 1 and 1.5
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(pan, {
          toValue: { x: 0, y: 0 },
          duration: 15000,
          useNativeDriver: true,
        }),
        Animated.timing(zoom, {
          toValue: 1,
          duration: 15000,
          useNativeDriver: true,
        }),
      ]).start(animate);
    };

    animate();

    return () => {
      pan.x.removeAllListeners();
      pan.y.removeAllListeners();
    };
  }, [pan, zoom]);

  return (
    <Animated.Image
      {...props}
      style={[
        props.style as ImageStyle,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: zoom },
          ],
        },
      ]}
    />
  );
};

export default AnimatedBackground;