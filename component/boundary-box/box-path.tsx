// BoundaryBox.tsx
import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import MyPath from '@c/controls/pure/my-path';
import {type PathDataType} from '@u/types';
import boundaryBoxCornors from './box-cornors';


const AnimatedBboxPath = Animated.createAnimatedComponent(MyPath);

type MyBoundaryBoxPathsProperties = {
	activeBoundaryBoxPath: PathDataType | undefined;
	scaleFactor?: number;
};

const MyBoundaryBoxPaths: React.FC<MyBoundaryBoxPathsProperties> = ({activeBoundaryBoxPath, scaleFactor = 1}) => {
	if (!activeBoundaryBoxPath?.visible) {
		return null;
	}

	const animatedBboxValue = useRef(new Animated.Value(0)).current;

	useEffect(() => () => {
		animatedBboxValue.stopAnimation();
	}, []);

	useEffect(() => {
		if (activeBoundaryBoxPath && activeBoundaryBoxPath.visible) {
			Animated.loop(
				Animated.timing(animatedBboxValue, {
					toValue: 1,
					duration: 250,
					useNativeDriver: false,
				}),
			).start();
		}
	}, [activeBoundaryBoxPath]);

	const strokeColor = animatedBboxValue.interpolate({
		inputRange: [0, 0.75, 1],
		outputRange: ['#6683c4', '#0b1870', '#410170'],
	});

	// Get accessories like 4 cornors & relevant icons

	const cornerPaths = boundaryBoxCornors(activeBoundaryBoxPath, scaleFactor);
	return (
		<>
			<AnimatedBboxPath
				keyProp={'selectBoundaryBox'}
				key={'selectBoundaryBox'}
				prop={{
					...activeBoundaryBoxPath,
					stroke: strokeColor,
					strokeWidth: (activeBoundaryBoxPath.strokeWidth || 2) * scaleFactor,
					strokeDashoffset: animatedBboxValue.interpolate({
						inputRange: [0, 1],
						outputRange: [7, -7],
					}),
				}} />

			{cornerPaths && cornerPaths.map((cornerPath, index) => (
				<MyPath
					key={index}
					keyProp={'cornerPath' + index}
					prop={{
						...cornerPath,
						stroke: '#0e1e8c',
					}}
				/>
			))}

		</>
	);
};

export default MyBoundaryBoxPaths;
