import React, {useState} from 'react';
import * as SystemUI from 'expo-system-ui';
import {Redirect, SplashScreen} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import AnimatedSplash from '@s/animated-splash';
import {MY_PRIMARY_COLOR} from '@u/types';
// Import * as Updates from 'expo-updates';

SystemUI.setBackgroundColorAsync(MY_PRIMARY_COLOR);

// Instruct SplashScreen not to hide yet, we want to do this manually
SplashScreen.preventAutoHideAsync().catch(() => {
	/* Reloading the app might trigger some race conditions, ignore them */
});

// SetBackgroundColorAsync("#020935");

const App = () => {
	const [isAnimationComplete, setAnimationComplete] = useState(false);

	// Const runTypeMessage = Updates.isEmbeddedLaunch
	//   ? 'This app is running from built-in code'
	//   : 'This app is running an update';

	return (
		<>
			<StatusBar hidden={false} style={'light'} translucent={true} />
			<AnimatedSplash
				onAnimationComplete={value => {
					setAnimationComplete(value);
				}}
			>
				{isAnimationComplete && <Redirect href={'/browse?heroEntry=yes'} />}
			</AnimatedSplash>
		</>
	);
};

export default App;
