
import { SplashScreen } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, View, useColorScheme } from "react-native";


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
      console.log('app ready')
      Animated.timing(animation, {
        toValue: 0,
        duration: 1000,
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
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: bgColor,
              opacity: animation,
            },
          ]}
        >
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
        </Animated.View>
      )}
    </View>
  );
};

export default AnimatedSplash;