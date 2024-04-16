// BoundaryBox.tsx
import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import MyPath from '@c/my-path';
import {createPathdata, getViewBoxTrimmed} from '@u/helper';
import {shapeData} from '@u/shapes';
import {MY_BLACK, type PathDataType, type PointType} from '@u/types';

export const getBoundaryBox = (selectedPaths: PathDataType[]): PathDataType | undefined => {
	if (selectedPaths.length === 0) {
		return null;
	}

	let maxStrokeWidth = 0;
	for (const item of selectedPaths) {
		if (item.strokeWidth > maxStrokeWidth) {
			maxStrokeWidth = item.strokeWidth;
		}
	}

	const offset = maxStrokeWidth / 2 + 2;
	const vbbox = getViewBoxTrimmed(selectedPaths, offset);
	const vbbPoints = vbbox.split(' ');
	const rectPath = shapeData({
		name: 'rectangle',
		start: {x: Number.parseFloat(vbbPoints[0]), y: Number.parseFloat(vbbPoints[1])},
		end: {x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]), y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3])},
	});

	const path = rectPath;
	const rectPathData = createPathdata('#fdf9b4', 2); // Stroke, width, opacity
	rectPathData.visible = true;
	rectPathData.path = path;
	rectPathData.strokeDasharray = '7,7';
	rectPathData.strokeDashoffset = 4;
	return rectPathData;
};

const boundaryBoxCornors = (activeBoundaryBoxPath: PathDataType | undefined, scaleFactor = 1) => {
	if (!activeBoundaryBoxPath?.path) {
		return null;
	}

	const vbbox = getViewBoxTrimmed([activeBoundaryBoxPath], 0);
	const vbbPoints = vbbox.split(' ');
	// Create corner paths
	const cornerStrokeWidth = 5 * scaleFactor;
	// Make cornerLength proportional to the size of the boundary box
	const cornerLength = Math.min(Number.parseFloat(vbbPoints[2]), Number.parseFloat(vbbPoints[3])) / 10;
	const corners = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'];
	return corners.flatMap(corner => {
		const cornerPathData1 = createPathdata(MY_BLACK, cornerStrokeWidth, 1);
		const cornerPathData2 = createPathdata(MY_BLACK, cornerStrokeWidth, 1);
		cornerPathData1.visible = true;
		cornerPathData2.visible = true;
		cornerPathData1.strokeDasharray = '0'; // Solid line
		cornerPathData2.strokeDasharray = '0'; // Solid line
		cornerPathData1.strokeDashoffset = 0;
		cornerPathData2.strokeDashoffset = 0;

		// Adjust start and end points based on the corner
		let start1: PointType;
		let end1: PointType;
		let start2: PointType;
		let end2: PointType;

		switch (corner) {
			case 'topLeft': {
				start1 = {x: Number.parseFloat(vbbPoints[0]), y: Number.parseFloat(vbbPoints[1])};
				end1 = {x: start1.x + cornerLength, y: start1.y};
				start2 = {x: Number.parseFloat(vbbPoints[0]), y: Number.parseFloat(vbbPoints[1])};
				end2 = {x: start2.x, y: start2.y + cornerLength};
				break;
			}

			case 'topRight': {
				start1 = {x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]), y: Number.parseFloat(vbbPoints[1])};
				end1 = {x: start1.x - cornerLength, y: start1.y};
				start2 = {x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]), y: Number.parseFloat(vbbPoints[1])};
				end2 = {x: start2.x, y: start2.y + cornerLength};
				break;
			}

			case 'bottomLeft': {
				start1 = {x: Number.parseFloat(vbbPoints[0]), y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3])};
				end1 = {x: start1.x + cornerLength, y: start1.y};
				start2 = {x: Number.parseFloat(vbbPoints[0]), y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3])};
				end2 = {x: start2.x, y: start2.y - cornerLength};
				break;
			}

			case 'bottomRight': {
				start1 = {x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]), y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3])};
				end1 = {x: start1.x - cornerLength, y: start1.y};
				start2 = {x: Number.parseFloat(vbbPoints[0]) + Number.parseFloat(vbbPoints[2]), y: Number.parseFloat(vbbPoints[1]) + Number.parseFloat(vbbPoints[3])};
				end2 = {x: start2.x, y: start2.y - cornerLength};
				break;
			}

			default: {
				start1 = {x: 0, y: 0};
				end1 = {x: 0, y: 0};
				start2 = {x: 0, y: 0};
				end2 = {x: 0, y: 0};
				break;
			}
		}

		const cornerPath1 = shapeData({
			name: 'line',
			start: start1,
			end: end1,
		});

		const cornerPath2 = shapeData({
			name: 'line',
			start: start2,
			end: end2,
		});

		cornerPathData1.path = cornerPath1;
		cornerPathData2.path = cornerPath2;

		return [cornerPathData1, cornerPathData2];
	});
};

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
