import AnimationParams from '@c/controls/animation-params';
import DashOffsetCorrection from '@c/controls/dash-offset-correction';
import {type AnimationParamsType} from '@u/types';
import React from 'react';

const createPreviewControls = ({
	onPreviewPlay,
	onPreviewStop,
	animationParams,
	setAnimationParams,
}) => [
	{
		key: 'play',
		icon: 'play',
		onPress: onPreviewPlay,
	},
	{
		key: 'stop',
		icon: 'stop',
		onPress: onPreviewStop,
	},
	{
		key: 'speed',
		icon: 'speed',
		title: 'Set Animation Params',
		extraControl: (
			<AnimationParams
				animationParams={animationParams}
				onAnimationParamsChanged={(value: AnimationParamsType) => {
					setAnimationParams((previous: AnimationParamsType) => ({
						...previous,
						speed: value.speed,
						loop: value.loop,
						delay: value.delay,
						transition: value.transition,
						transitionType: value.transitionType,
					}));
				}}
			/>
		),
		extraPanel: {width: 310, height: 220},
	},
	{
		key: 'erasure',
		icon: 'erasure',
		title: 'Clear fragments',
		extraControl: (
			<DashOffsetCorrection
				value={animationParams.correction}
				onValueChanged={(value: number) => {
					setAnimationParams((previous: AnimationParamsType) => ({
						...previous,
						correction: value,
					}));
				}}
			/>
		),
		extraPanel: {width: 300, height: 140},
	},
];

export default createPreviewControls;
