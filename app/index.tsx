import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Link, Redirect, SplashScreen, useRouter } from "expo-router";
// import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AnimatedSplashAppLoader from "@s/animated-splash";
import { SafeAreaView } from "react-native-safe-area-context";

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

const splashImage = require("../assets/splash.png");
const bgColor = "#0000FF"
// const bgImage = require("../assets/bg2.png");

const App = () => {
  const [isAnimationComplete, setAnimationComplete] = useState(false);

  return (
    <>
      <StatusBar translucent={true} style="auto" />
      <AnimatedSplashAppLoader
        image={splashImage}
        bgColor={bgColor}
        onAnimationComplete={(value) => setAnimationComplete(value)}
      >
        {isAnimationComplete && <Redirect href={"/browse"} />}
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
