import MyPathLogo from "@c/logo/my-path-logo";
import myConsole from "@c/my-console-log";
import { SplashScreen } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Easing } from "react-native-reanimated";


const AnimatedSplash = ({
  children,
  image,
  bgColor,
  onAnimationComplete,
}: {
  children: React.ReactNode;
  image: any;
  bgColor: string;
  onAnimationComplete?: (arg0: boolean) => void;
}) => {
  const [isAppReady, setAppReady] = useState(false);
  const [isAnimationComplete, setAnimationComplete] = useState(false);

  const animationValue = new Animated.Value(0);
  const animationValue1 = new Animated.Value(0);


  const rotateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1800deg'], // adjust this to change the rotation angle
  });


  const size = animationValue1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [115, 105, 120] // adjust this to change the scaling
  });


  useEffect(() => {
    if (isAppReady) {
      myConsole.log('[ANIMATED SPLASH] app ready');

      Animated.timing(animationValue1, {
        toValue: 1,
        duration: 1000, // adjust this to change the speed of the animation
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();

      Animated.timing(animationValue, {
        toValue: 1,
        duration: 7000, // adjust this to change the speed of the animation
        easing: Easing.circle,
        useNativeDriver: false,
      }).start(() => {
        setAnimationComplete(true)
        if (onAnimationComplete) {
          onAnimationComplete(true);
        }
      });
    }
  }, [isAppReady]);

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
      // Load stuff, life read files from the file syste,, custom fonts ??
      await Promise.all([]);
      // await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (e) {
      // handle errors
    } finally {
      setAppReady(true);
    }
  }, []);


  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isAnimationComplete && (
        <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: '#020935',
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          }} onLayout={onImageLoaded}>

<Animated.View style={{
  width: size,
  height: size,
  transform: [{rotateY}]
}}
  >
          <MyPathLogo
            animate={false}
            width={'100%'}
            height={'100%'}
          />
          </Animated.View>

        </View>

      )}
    </View>
  );
};

export default AnimatedSplash;