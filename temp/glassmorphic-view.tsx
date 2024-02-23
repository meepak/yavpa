import React from 'react';
import { View, StyleSheet } from 'react-native';

const GlassmorphicView = ({ children, style }) => {
  return (
    <View style={{...style, ...styles.glassView}}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  glassView: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
    borderRadius: 10, // Rounded corners
    padding: 20, // Padding inside the view
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    // Elevation for Android
    elevation: 8,
  }
});

export default GlassmorphicView;
