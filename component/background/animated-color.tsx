import {MY_ON_PRIMARY_COLOR_OPTIONS} from '@u/types';
import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';

const AnimatedColor = ({children}) => {
	const animation = new Animated.Value(0);
	const colorIndex = useRef(0);
	const colors = MY_ON_PRIMARY_COLOR_OPTIONS;
	/*
  [
    '#fde2e4CC',
    '#e2f0fdCC',
    '#e4fde2CC',
    '#f0f9f7CC',
    '#e2e4fdCC',
    '#f7f0f9CC',
    '#e0f2fdCC',
    '#fde4e2CC',
    '#f0f7f9CC',
    '#fde2f4CC'
  ];
*/
	const changeColor = () => {
		colorIndex.current = (colorIndex.current + 1) % colors.length;
		Animated.timing(animation, {
			toValue: colorIndex.current,
			duration: 20_000,
			useNativeDriver: false,
		}).start(() => requestAnimationFrame(changeColor));
	};

	useEffect(() => {
		changeColor();
	}, []);

	const interpolateColor = animation.interpolate({
		inputRange: colors.map((_, i) => i),
		outputRange: colors,
	});

	return (
		<Animated.View style={{...StyleSheet.absoluteFillObject, backgroundColor: interpolateColor}}>
			{children}
		</Animated.View>
	);
};

export default AnimatedColor;
