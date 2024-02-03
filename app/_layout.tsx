import { StyleSheet, View } from 'react-native';
import AnimatedBackground from "@c/background/animated-background";
import { Slot } from 'expo-router';
import bgImage from "@a/bg2.png";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
       {/* <AnimatedBackground source={bgImage} style={StyleSheet.absoluteFill} /> */}
      <Slot /> 
    </SafeAreaView>
  );
}
