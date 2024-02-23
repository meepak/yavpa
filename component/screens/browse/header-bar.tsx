import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { Extrapolation, SharedValue, interpolate, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import logo from '@a/logo2.png';
import MyPath from '@c/my-path';
import MyPathLogo from '@c/logo/my-path-logo';
// import MySheetModal from '@c/my-sheet-modal';


interface HeaderBarProps {
  scrollValue: SharedValue<number>;
}

const DEFAULT_TOP_INSET = 30;


export const HeaderBar: React.FC<HeaderBarProps> = ({ scrollValue }) => {
  const insets = useSafeAreaInsets();
  // const [showModal, setShowModal] = React.useState(false);

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
            right: insets.right + 15
          },
        ]}>
        <Animated.View style={headerDetailsContainerAnimatedStyle}>
          {/* <Image
            source={logo}
            style={styles.headerDetailsImage}
          /> */}
          <View style={{ top: 5 }}>
            <MyPathLogo animate={false} width={52} height={52} />
          </View>
        </Animated.View>
        <Animated.View style={[styles.headerDetailsContainer, headerDetailsContainerAnimatedStyle]}>
          <Text
            style={styles.headerDetailsButtonTitle}
          // onPress={() => {
          //   setShowModal(!showModal)
          //   console.log ("Model is showing ", {showModal})
          // }}
          >
            MY PATH
          </Text>
        </Animated.View>
      </View>
      {/* <MySheetModal isVisible={showModal} height={500} onClose={() => setShowModal(false)}>
        <Text>Sheet Modal</Text>
        </MySheetModal> */}
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
