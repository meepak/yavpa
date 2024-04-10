
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Easing } from "react-native-reanimated";
import { SplashScreen } from "expo-router";
import * as SystemUI from 'expo-system-ui';
import myConsole from "@c/my-console-log";
import MyPathLogo from "@c/logo/my-path-logo";
import { StatusBar } from "expo-status-bar";

SystemUI.setBackgroundColorAsync("#020935");

const AnimatedSplash = ({
  children,
  onAnimationComplete,
}: {
  children: React.ReactNode;
  onAnimationComplete?: (arg0: boolean) => void;
}) => {
  const [isAppReady, setAppReady] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [isAnimationComplete, setAnimationComplete] = useState(false);

  const animationValueRotateY = new Animated.Value(0);
  const animationValueSize = new Animated.Value(0);


  const rotateY = animationValueRotateY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1800deg'], // adjust this to change the rotation angle
  });


  const size = animationValueSize.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: [110, 105, 100, 110, 115, 120] // adjust this to change the scaling
  });


  useEffect(() => {
    if (isAppReady) {
      // myConsole.log('ANIMATED SPLASH - app ready');

      Animated.parallel([
        Animated.timing(animationValueSize, {
          toValue: 1,
          duration: 1000, // adjust this to change the speed of the animation
          easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(animationValueRotateY, {
          toValue: 1,
          duration: 5000, // adjust this to change the speed of the animation
          easing: Easing.exp,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setAnimationComplete(true);
        if (onAnimationComplete) {
          onAnimationComplete(true);
        }
      });
    }
  }, [isAppReady]);

  useEffect(() => {
    if (logoLoaded) {
      try {
        setTimeout(async () => await SplashScreen.hideAsync(), 300);
        // Load stuff, like read files from the file system, custom fonts, etc.
        // await Promise.all([]);
        // await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        // handle errors
      } finally {
        setAppReady(true);
      }
    }
  }, [logoLoaded]);


  return (
    <>
      <StatusBar hidden={false} style={"light"} backgroundColor='transparent' translucent={true} /><View style={{ flex: 1 }}>
        {isAppReady && children}
        {!isAnimationComplete && (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: '#020935',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}>

            <Animated.View style={{
              width: size,
              height: size,
              transform: [{ rotateY }]
            }}
            >
              <MyPathLogo
                animate={false}
                width={'100%'}
                height={'100%'}
                isLoaded={(val) => setLogoLoaded(val) }
              />
            </Animated.View>

          </View>

        )}
      </View></>
  );
};

export default AnimatedSplash;