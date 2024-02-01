import React from 'react'
import { View, StyleSheet } from 'react-native';
import { ResizeMode, Video } from 'expo-av';

// It's neither dark nor light but fixed custom shade in betwee
const VideoBackground = ({isReady}) => (
  <View style={StyleSheet.absoluteFillObject}>
    {/* <SvgAnimatedMuncheBg /> */}
    <Video
      isLooping
      isMuted
      positionMillis={500}
      onLoad={isReady}
      resizeMode={ResizeMode.COVER}
      shouldPlay
      source={require('../../assets/sea.mp4')}
      style={{ flex: 1 }}
    />

    {/* <View
      style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
      }}
    ></View> */}
  </View>
)

export default VideoBackground
