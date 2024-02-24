
import {Background, BackgroundOptions} from "@c/background";
import { SplashScreen } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";


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

  useEffect(() => {
    if (isAppReady) {
      console.log('[ANIMATED SPLASH] app ready')
      Animated.timing(animation, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
        <Background option={BackgroundOptions.splash}>
          <Animated.Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "contain",
              transform: [
                {
                  scale: animation,
                },
              ],
            }}
            source={image}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
          {/* <MyPathLogo animate={false} width={"100%"} height={"100%"} /> */}
          </Background>
      )}
    </View>
  );
};

export default AnimatedSplash;