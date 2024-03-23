
import {Background, BackgroundOptions} from "@c/background";
import MyPathLogo from "@c/logo/my-path-logo";
import myConsole from "@c/my-console-log";
import { HEADER_HEIGHT } from "@u/types";
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
  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isAnimationComplete, setAnimationComplete] = useState(false);

  const animationValue = new Animated.Value(0);

  const translateX = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100] // adjust this to change the horizontal movement
  });

  const translateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100] // adjust this to change the vertical movement
  });

  const scale = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.5, 1] // adjust this to change the scaling
  });

  useEffect(() => {
    if (isAppReady) {
      myConsole.log('[ANIMATED SPLASH] app ready')
      // Animated.timing(animation, {
      //   toValue: 0,
      //   duration: 1200,
      //   useNativeDriver: true,
      // }).start(() => {
      //   setAnimationComplete(true)
      //   if (onAnimationComplete) {
      //     onAnimationComplete(true);
      //   }
      // });


        Animated.timing(animationValue, {
          toValue: 1,
          duration: 7000, // adjust this to change the speed of the animation
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => {
        setAnimationComplete(true)
        if (onAnimationComplete) {
          onAnimationComplete(true);
        }
      });
    }
    },[isAppReady]);

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
      <></>
      {isAppReady && children}
        {isAppReady && children}
        {!isAnimationComplete && (
        <Background option={BackgroundOptions.splash}>
          <Animated.View
            style={{
              width: "100%",
              height: HEADER_HEIGHT + 210,
              transform: [
                { translateX },
                { translateY },
                { scale : translateX},
              ],
            }}
          >
          </Animated.View>
          <Animated.View
            style={{
              width: "100%",
              height: "100%",
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
            }}
            onLayout={onImageLoaded}
            >
          <MyPathLogo animate={false} width={120} height={120} />
            </Animated.View>
      </Background>
      )}
    </View>
  );
};

export default AnimatedSplash;