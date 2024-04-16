
import {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {Easing} from 'react-native-reanimated';
import {SplashScreen} from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import myConsole from '@c/my-console-log';
import MyPathLogo from '@c/logo/my-path-logo';
import {StatusBar} from 'expo-status-bar';
import {MY_PRIMARY_COLOR} from '@u/types';

SystemUI.setBackgroundColorAsync(MY_PRIMARY_COLOR);

const AnimatedSplash = ({
	children,
	onAnimationComplete,
}: {
	children: React.ReactNode;
	onAnimationComplete?: (argument0: boolean) => void;
}) => {
	const [isAppReady, setAppReady] = useState(false);
	const [logoLoaded, setLogoLoaded] = useState(false);
	const [isAnimationComplete, setAnimationComplete] = useState(false);

	const animationValueRotateY = new Animated.Value(0);
	const animationValueSize = new Animated.Value(0);

	const rotateY = animationValueRotateY.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '540deg'], // Adjust this to change the rotation angle
	});

	const size = animationValueSize.interpolate({
		inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
		outputRange: [110, 105, 100, 110, 115, 120], // Adjust this to change the scaling
	});

	useEffect(() => {
		if (isAppReady) {
			// MyConsole.log('ANIMATED SPLASH - app ready');

			Animated.parallel([
				Animated.timing(animationValueSize, {
					toValue: 1,
					duration: 400, // Adjust this to change the speed of the animation
					easing: Easing.ease,
					useNativeDriver: false,
				}),
				Animated.timing(animationValueRotateY, {
					toValue: 1,
					duration: 2400, // Adjust this to change the speed of the animation
					easing: Easing.exp,
					useNativeDriver: false,
				}),
			]).start(() => {
				setAnimationComplete(true);
				if (onAnimationComplete) {
					onAnimationComplete(true);
				}
			});
		}
	}, [isAppReady]);

	useEffect(() => {
		if (logoLoaded) {
			try {
				setTimeout(async () => SplashScreen.hideAsync(), 300);
				// Load stuff, like read files from the file system, custom fonts, etc.
				// await Promise.all([]);
				// await new Promise((resolve) => setTimeout(resolve, 2000));
			} catch {
				// Handle errors
			} finally {
				setAppReady(true);
			}
		}
	}, [logoLoaded]);

	return (
		<>
			<StatusBar hidden={false} style={'light'} backgroundColor='#000000' translucent={true} />
			<View style={{flex: 1}}>
				{isAppReady && children}
				{!isAnimationComplete && (
					<View
						style={{
							...StyleSheet.absoluteFillObject,
							backgroundColor: MY_PRIMARY_COLOR,
							justifyContent: 'center',
							alignItems: 'center',
							alignContent: 'center',
						}}>

						<Animated.View style={{
							width: size,
							height: size,
							transform: [{rotateY}],
						}}
						>
							<MyPathLogo
								animate={false}
								width={'100%'}
								height={'100%'}
								isLoaded={value => {
									setLogoLoaded(value);
								} }
							/>
						</Animated.View>

					</View>

				)}
			</View></>
	);
};

export default AnimatedSplash;
