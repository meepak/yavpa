import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MyPathLogo from '@c/logo/my-path-logo';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@u/types';
import { HeaderGradientBackground } from '../file/header';
// import MySheetModal from '@c/my-sheet-modal';




export const HeaderBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  // const [showModal, setShowModal] = React.useState(false);

  return (
    // <HeaderGradientBackground>
      <View
        style={{
          top: 0,
          right: 0,
          width: 100,
          height: SCREEN_HEIGHT,
          // borderWidth: 1,
          // borderColor: 'red',
          backgroundColor: 'transparent',
          alignContent: 'flex-start',
          justifyContent: 'flex-start',

        }}>
          <View style={{left: 24, top: 20}}>
        {/* <MyPathLogo animate={false} width={52} height={52} /> */}
        </View>
        {/* <Text style={styles.headerDetailsButtonTitle}>
          MY PATH
        </Text> */}
      </View>
    // </HeaderGradientBackground>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: 'absolute',
    flexDirection: 'column',
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
