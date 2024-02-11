import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import logo from '@a/logo2.png';


interface HeaderBarProps {
  scrollValue: SharedValue<number>;
}

const DEFAULT_TOP_INSET = 30;

export const HeaderBar: React.FC<HeaderBarProps> = ({ scrollValue }) => {
  const insets = useSafeAreaInsets();

  const headerDetailsContainerAnimatedStyle = useAnimatedStyle(() => {
    return { opacity: interpolate(scrollValue.value, [0, 140, 238], [0, 0, 1], Extrapolation.CLAMP) };
  }, [scrollValue]);

  return (
    <>
      <View
        style={[
          styles.headerWrapper,
          { 
            top: insets.top || DEFAULT_TOP_INSET, 
            left: insets.left + 15, 
            right: insets.right + 15 },
        ]}>
        <Animated.View style={headerDetailsContainerAnimatedStyle}>
          <Image
            source={logo}
            style={styles.headerDetailsImage}
          />
        </Animated.View>
        <Animated.View style={[styles.headerDetailsContainer, headerDetailsContainerAnimatedStyle]}>
            <Text style={styles.headerDetailsButtonTitle}>MY PATH</Text>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerDetailsImage: {
    width: 42,
    height: 42,
    bottom: -5,
  },
  headerDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  headerDetailsButtonTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
