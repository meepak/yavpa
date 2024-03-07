import React, { useState } from "react";
import { StyleSheet } from "react-native";

import { Redirect, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ScreenOrientation from 'expo-screen-orientation';
import AnimatedSplashAppLoader from "@s/animated-splash";
// import * as Updates from 'expo-updates';


// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});



import splashImage from "../assets/splash.png";
const bgColor = 'transparent';

const App = () => {
  const [isAnimationComplete, setAnimationComplete] = useState(false);

  // const runTypeMessage = Updates.isEmbeddedLaunch
  //   ? 'This app is running from built-in code'
  //   : 'This app is running an update';


  return (
    <>
      <StatusBar hidden />
      <AnimatedSplashAppLoader
        image={splashImage}
        bgColor={bgColor}
        onAnimationComplete={(value) => setAnimationComplete(value)}
      >
        {isAnimationComplete && <Redirect href={"/file"} />}
      </AnimatedSplashAppLoader>
    </>
  )
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
