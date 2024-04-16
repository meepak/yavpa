import React, {useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import {
	type AnimationParamsType,
	CANVAS_WIDTH,
	MY_BLACK,
	type MyPathDataType,
} from '@u/types';

const AnimatedLine = Animated.createAnimatedComponent(Line);
type AnimationTrackBarType = {
	myPathData: MyPathDataType;
	animationParams: AnimationParamsType;
};
export type AnimationTrackBarInterface = {
	play: () => void;
	stop: () => void;
	reset: () => void;
} & AnimationTrackBarType;
export const AnimationTrackBar = React.forwardRef(
	({myPathData, animationParams}: AnimationTrackBarType, reference) => {
		// Calculate the total animation time
		const totalAnimationTime = myPathData?.pathData.reduce(
			(accumulator, item) => accumulator + item.time,
			0,
		);

		// Create an array to store the animations
		const animationsX2: any[] = [];

		// Create a reference to store the animation
		const animationX2Reference = useRef<Animated.CompositeAnimation | undefined>();
		const [animatedX2Values, setAnimatedX2Values] = useState<Animated.Value[]>(
			[],
		);
		const [allLines, setAllLines] = useState<
		Array<{index: number; x1: number; color: string}>
		>([]);

		const createAnimation = () => {
			let startX = 0;
			const newAnimatedValues: any[] = [];
			const newAllLines: any[] = [];
			myPathData?.pathData.map((path, index) => {
				// Calculate the length of the line based on the animation time of the path
				const lineLength = (path.time / totalAnimationTime) * CANVAS_WIDTH;
				const x2 = new Animated.Value(startX);
				// Create the animation for the line
				const animation = Animated.timing(x2, {
					toValue: startX + lineLength,
					duration: path.time / animationParams.speed, // Later path should have its own speed value
					useNativeDriver: true,
				});

				// Add the animation to the array
				animationsX2.push(animation);
				newAllLines.push({index, x1: startX, color: path.stroke || MY_BLACK});
				// Update the starting point for the next line
				startX += lineLength;
				newAnimatedValues.push(x2);
			});

			setAllLines(newAllLines);
			setAnimatedX2Values(newAnimatedValues);
			animationX2Reference.current = Animated.sequence(animationsX2);
		};

		useEffect(() => {
			// Console.log('animation track bar updated')
			reset();
			createAnimation();
		}, [myPathData, animationParams]);

		const play = () => {
			if (!animationX2Reference.current) {
				createAnimation();
			}

			if (animationX2Reference.current) {
				animationX2Reference?.current?.start();
			}
		};

		const reset = () => {
			if (animationX2Reference.current) {
				animationX2Reference?.current?.stop();
				animationX2Reference?.current?.reset();
			}
		};

		const stop = () => {
			if (animationX2Reference.current) {
				animationX2Reference?.current?.stop();
			}
		};

		React.useImperativeHandle(reference, () => ({
			play,
			stop,
			reset,
		}));

		return (
			<Svg height='5' width={CANVAS_WIDTH}>
				{animatedX2Values.map((animatedValue, index) => {
					const currentLine = allLines[index];

					if (currentLine) {
						const line = (
							<AnimatedLine
								key={currentLine.index}
								x1={currentLine.x1.toString()}
								y1='0'
								x2={animatedValue}
								y2='0'
								stroke={currentLine.color}
								strokeWidth='4'
							/>
						);
						return line;
					}

					return null;
				})}
			</Svg>
		);
	},
);
