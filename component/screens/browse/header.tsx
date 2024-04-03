import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image'
import Animated, { Extrapolation, SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import MyPathLogo from '@c/logo/my-path-logo';
import { SCREEN_WIDTH } from '@u/types';
import MyGradientBackground from '@c/my-gradient-background';
import MyIcon from '@c/my-icon';
import MyPreferences from '@c/preferences/my-preferences';
import myConsole from '@c/my-console-log';

const banner = require('@a/banner.png');


interface HeaderProps {
  scrollValue: SharedValue<number>;
}

const Header: React.FC<HeaderProps> = ({ scrollValue }) => {
  const [animateLogo, setAnimateLogo] = React.useState(false);
  const [preferencesVisible, setPreferencesVisible] = React.useState(false);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollValue.value, [0, 180, 220, 270], [0.7, 0.2, 0.1, 0], Extrapolation.CLAMP),
    }
  }, [scrollValue]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: interpolate(scrollValue.value, [0, 180, 220], [1, 1, 0.5], Extrapolation.CLAMP) },
        { translateY: interpolate(scrollValue.value, [0, 180, 220], [0, 0, 60], Extrapolation.CLAMP) },
        { translateX: interpolate(scrollValue.value, [0, 180, 220], [0, 0, -30], Extrapolation.CLAMP) }
      ]
    }
  }, [scrollValue]);

  const nameAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(scrollValue.value, [0, 180, 205, 220], [0, 0, 65, 65], Extrapolation.CLAMP) },
        { translateX: interpolate(scrollValue.value, [0, 180, 205, 220], [0, 0, 0, (SCREEN_WIDTH - 275)], Extrapolation.CLAMP) }
      ]
    }
  }, [scrollValue]);

  const sloganAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollValue.value, [0, 180, 220, 270], [1, 1, 0, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollValue.value, [0, 180, 205, 220], [0, 0, 50, 50], Extrapolation.CLAMP) },
        { translateX: interpolate(scrollValue.value, [0, 180, 205, 220], [0, 0, 0, (SCREEN_WIDTH - 360)], Extrapolation.CLAMP) }
      ]
    }
  }, [scrollValue]);

  const preferencesIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(scrollValue.value, [0, 180, 205, 220], [0, 0, 65, 65], Extrapolation.CLAMP) },
        { translateX: interpolate(scrollValue.value, [0, 180, 205, 220], [10, 10, 10, 25], Extrapolation.CLAMP) }
      ]
    }
  }, [scrollValue]);


  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setAnimateLogo(prev => !prev);
    }, 4000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <><View style={styles.headerWrapper}>
      <MyGradientBackground>
        <Animated.View style={imageAnimatedStyle}>
          <Image
            source={banner}
            style={styles.image} />
        </Animated.View>
        <View style={styles.container}>
          <Animated.View style={logoAnimatedStyle}>
            <MyPathLogo animate={animateLogo} width={97} height={97} />
          </Animated.View>
          <View style={styles.details}>
            <Animated.View style={nameAnimatedStyle}>
              <Text
                style={styles.detailsHeader}>
                MY PATH
              </Text>
            </Animated.View>

            <Animated.View style={sloganAnimatedStyle}>
              <Text style={styles.detailsDesc}>Animate every stroke.</Text>
            </Animated.View>

          </View>
          <Animated.View style={preferencesIconAnimatedStyle}>
            <MyIcon name='user-preferences' color='#FFFFFF' strokeWidth={1} fill='#FFFFFF' size={28} onPress={() => setPreferencesVisible(true)} />
          </Animated.View>
        </View>
      </MyGradientBackground>
    </View>
    <MyPreferences isVisible={preferencesVisible} onClose={() => {myConsole.log('closing'); setPreferencesVisible(false);}} />
    </>
  );
};

const styles = StyleSheet.create({
  headerDetailsButtonTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  image: {
    height: 210,
    marginLeft: -25,
    opacity: 0.7,
  },
  container: {
    flexDirection: 'row',
    marginVertical: 17,
    marginHorizontal: 17,
  },
  logo: {
    width: 97,
    height: 97,
    bottom: -5
  },
  details: {
    marginLeft: 15,
  },
  detailsHeader: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  detailsDesc: {
    color: '#CCCCCC',
    fontSize: 20,
  },
  headerWrapper: {
    // top: -2
  }
});

export default Header;