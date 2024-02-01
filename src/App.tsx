import React from "react";
import * as SplashScreen from "expo-splash-screen";
// import { ColorValue, ImageBackground, StyleSheet, View } from "react-native"; // Add the missing import statement for StyleSheet
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AnimatedSplashAppLoader from "@/animated-splash";
import DrawScreen from "@/app/draw";
// import AnimatedBackground from "@/components/background/animated-background";
// import VideoBackground from "@/components/background/video-background";
// import YavpaStyled from "./components/background/yavpa-styles";
// import { Link } from "expo-router";
// import AnimatedBg from "./components/background/animated-bg";
// import BrowseScreen from "./app";

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

const splashImage = require("../assets/splash.png");
const bgColor = "#FFFFFF"
const bgImage = require("../assets/bg2.png");

const App = () => (
  <>
    <StatusBar translucent={true} style="auto" />
    <AnimatedSplashAppLoader image={splashImage} bgColor={bgColor}>
      <SafeAreaProvider>
        {/* <AnimatedBg /> */}
        {/* <AnimatedBackground source={bgImage} style={StyleSheet.absoluteFill} /> */}
        {/* <VideoBackground isReady={null} /> */}
        {/* <View
          style={{
            position: 'absolute',
            top: 30,
            right: 30,
            backgroundColor: '#959595',
          }}
        >
          <YavpaStyled />
        </View> */}
        {/* <View style={[StyleSheet.absoluteFill, {backgroundColor: '#909090'}]} /> */}
       
       <DrawScreen />
      </SafeAreaProvider>
    </AnimatedSplashAppLoader>
  </>
);

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
