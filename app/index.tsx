import React, { useState } from "react";
import { setBackgroundColorAsync } from 'expo-system-ui';

import { Redirect, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AnimatedSplash from "@s/animated-splash";
// import * as Updates from 'expo-updates';


// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});


// setBackgroundColorAsync("#020935");

const App = () => {
  const [isAnimationComplete, setAnimationComplete] = useState(false);

  // const runTypeMessage = Updates.isEmbeddedLaunch
  //   ? 'This app is running from built-in code'
  //   : 'This app is running an update';

  return (
    <>
      <StatusBar hidden={false} style={"light"} translucent={true} backgroundColor='#00000000' />
      <AnimatedSplash
        onAnimationComplete={(value) => setAnimationComplete(value)}
      >
        {isAnimationComplete && <Redirect href={"/browse?heroEntry=yes"} />}
      </AnimatedSplash>
    </>
  )
};

export default App;
