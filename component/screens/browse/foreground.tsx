import * as React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import {Image} from 'expo-image'
import Animated, { Extrapolation, SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import banner from '@a/banner.png';
import alphaVersion from '@a/alpha-version.png';
import MyPathLogo from '@c/logo/my-path-logo';
import { HeaderGradientBackground } from '@c/screens/file/header';

const screenWidth = Dimensions.get('window').width;

interface ForegroundProps {
    scrollValue: SharedValue<number>;
}

export const Foreground: React.FC<ForegroundProps> = ({ scrollValue }) => {
  const [animateLogo, setAnimateLogo] = React.useState(false);
  const foregroundWrapperAnimatedStyle = useAnimatedStyle(() => {
    return { opacity: interpolate(scrollValue.value, [0, 120, 180], [1, 1, 0], Extrapolation.CLAMP) };
  }, [scrollValue]);

  React.useEffect(() => {
    setTimeout(() => {
      setAnimateLogo(false);
    setAnimateLogo(true);
    }, 4000)
  }, []);

  return (
    <View pointerEvents="none" style={styles.foregroundWrapper}>
      <HeaderGradientBackground> 
      <Animated.View style={foregroundWrapperAnimatedStyle}>
        <Image
          source={banner}
          style={styles.foregroundImage}
        />
        <View style={styles.foregroundContainer}>
          <MyPathLogo animate={animateLogo} width={97} height={97} />
          <View style={styles.foregroundDetails}>
            <Text
              style={styles.foregroundDetailsHeader}>
              MY PATH
            </Text>
            <Text style={styles.foregroundDetailsDesc}>Animate every stroke.</Text>
            <View style={styles.foregroundActionsContainer}>
              <Image source={alphaVersion} style={styles.foregroundActionsVersion} />
            </View>
          </View>
        </View>
      </Animated.View>
      </HeaderGradientBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  headerDetailsButtonTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  foregroundImage: {
    height: 210,
    marginLeft: -25,
  },
  foregroundContainer: {
    flexDirection: 'row',
    marginVertical: 17,
    marginHorizontal: 17,
  },
  foregroundLogo: {
    width: 97,
    height: 97,
    bottom: -5
  },
  foregroundDetails: {
    marginLeft: 15,
  },
  foregroundDetailsHeader: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  foregroundDetailsDesc: {
    color: '#CCCCCC',
    fontSize: 20,
  },
  foregroundActionsContainer: {
    flexDirection: 'row',
    marginTop:20,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    width: screenWidth - 88,
  },
  foregroundActionsVersion: {
    height: 16,
  },
  foregroundWrapper: {
    // backgroundColor: '#0000FF',
  },
});
