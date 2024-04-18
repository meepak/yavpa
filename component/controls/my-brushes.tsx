import React from 'react';
import {
	Defs, LinearGradient, Pattern, RadialGradient, Stop, Image,
} from 'react-native-svg';
import {type BrushType, type GradientBrushPropType, type PatternBrushPropType} from '../../utilities/types';

export const LinearGradientBrush
  = ({guid, colors, gradientTransform = 'rotate(0, 0, 0)'}: GradientBrushPropType) => (
  	<Defs key={guid}>
  		<LinearGradient gradientUnits='objectBoundingBox' id={guid} x1='0%' y1='0%' x2='100%' y2='0%'>
  			{colors.map((color, index) => (
  				<Stop
  					key={index}
  					offset={`${(index / (colors.length - 1)) * 100}%`}
  					stopColor={color}
  					stopOpacity='1'
  				/>
  			))}
  		</LinearGradient>
  	</Defs>
  );

export const RadialGradientBrush
  = ({guid, colors}: {guid: string; colors: string[]}) => (
  	<Defs key={guid}>
  		<RadialGradient gradientUnits='userSpaceOnUse' id={guid} cx='0.5' cy='0.5' r='0.5'>
  			{colors.map((color, index) => (
  				<Stop
  					key={index}
  					offset={`${(index / (colors.length - 1)) * 100}%`}
  					stopColor={color}
  					stopOpacity='1'
  				/>
  			))}
  		</RadialGradient>
  	</Defs>
  );

export const PatternBrush = ({guid, pattern}: PatternBrushPropType) => (
	<Defs key={guid}>
		<Pattern id={guid} patternUnits='userSpaceOnUse' x='0' y='0' width='50' height='50'>
			<Image href={pattern} x='0' y='0' width='200' height='200' />
		</Pattern>
	</Defs>
);

export const BlurBrush = ({guid}) => (
	<Defs key={guid}>
		<LinearGradient x1='50%' y1='0%' x2='50%' y2='100%' id='nnneon-grad'>
			<Stop stop-color='hsl(157, 100%, 54%)' stop-opacity='1' offset='0%'></Stop>
			<Stop stop-color='hsl(331, 87%, 61%)' stop-opacity='1' offset='100%'></Stop>
		</LinearGradient>
		<filter id='nnneon-filter' x='-100%' y='-100%' width='400%' height='400%' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'>
			<feGaussianBlur stdDeviation='17 8' x='0%' y='0%' width='100%' height='100%' in='SourceGraphic' edgeMode='none' result='blur'></feGaussianBlur>
		</filter>
		<filter id='nnneon-filter2' x='-100%' y='-100%' width='400%' height='400%' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'>
			<feGaussianBlur stdDeviation='10 17' x='0%' y='0%' width='100%' height='100%' in='SourceGraphic' edgeMode='none' result='blur'></feGaussianBlur>
		</filter>
	</Defs>
);

export const getBrush = (brush: BrushType) => {
	switch (brush.name) {
		case 'LinearGradientBrush': {
			return LinearGradientBrush({
				guid: brush.params.guid,
				colors: (brush.params as GradientBrushPropType).colors,
			});
		}

		case 'RadialGradientBrush': {
			return RadialGradientBrush({
				guid: brush.params.guid,
				colors: (brush.params as GradientBrushPropType).colors,
			});
		}

		case 'PatternBrush': {
			return PatternBrush({
				guid: brush.params.guid,
				pattern: (brush.params as PatternBrushPropType).pattern,
			});
		}

		default: {
			return null;
		}
	}
};

// Brush GUID once assigned should always be same
export const Brushes: BrushType[] = [
	{
		name: 'LinearGradientBrush',
		params: {guid: 'MYB1', colors: ['rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(0,0,255)']},
	},
	{
		name: 'LinearGradientBrush',
		params: {
			guid: 'MYIR1',
			colors: [
				'rgb(255,0,0)',
				'rgb(255,165,0)',
				'rgb(255,255,0)',
				'rgb(0,128,0)',
				'rgb(0,0,255)',
				'rgb(75,0,130)',
				'rgb(238,130,238)',
			],
		},
	},
	{
		name: 'LinearGradientBrush',
		params: {guid: 'MYB3', colors: ['rgba(105,105,105,1)', 'rgba(169,169,169,0.5)', 'rgba(192,192,192,1)', 'rgba(169,169,169,0.5)', 'rgba(105,105,105,1)']},
	},
	{

		name: 'LinearGradientBrush',
		params: {guid: 'MYB4', colors: ['rgba(112,128,144,1)', 'rgba(192,192,192,0.5)', 'rgba(112,128,144,1)']},
	},
	{
		name: 'PatternBrush',
		params: {guid: 'MYB5', pattern: require('@a/pattern/1.jpg')},
	},
	{
		name: 'PatternBrush',
		params: {guid: 'MYB6', pattern: require('@a/pattern/2.jpg')},
	},
	{
		name: 'PatternBrush',
		params: {guid: 'MYB7', pattern: require('@a/pattern/3.jpg')},
	},
	{
		name: 'PatternBrush',
		params: {guid: 'MYB8', pattern: require('@a/pattern/4.jpg')},
	},
	{
		name: 'RadialGradientBrush',
		params: {guid: 'MYB9', colors: ['rgb(255,0,0)', 'rgb(0,255,0)']},
	},
	{

		name: 'LinearGradientBrush',
		params: {guid: 'MYD1', colors: ['hsl(265, 55%, 30%)', 'hsl(265, 55%, 60%)'], gradientTransform: 'rotate(55, 0.5, 0.5)'},
	},
	{
		name: 'BlurBrush', params: {guid: 'NEOG1'},
	},
	// {
	//   name: "RadialGradientBrush",
	//   params: {guid: "MYB2", colors: ["rgb(255,0,0)", "rgb(0,0,255)"] }
	// },
	// {
	//   name: "RadialGradientBrush",
	//   params: {guid: "MYB5", colors: ["rgba(105,105,105,1)", "rgba(169,169,169,0.5)", "rgba(192,192,192,1)", "rgba(169,169,169,0.5)", "rgba(105,105,105,1)"] }
	// },
	// {
	//   name: "RadialGradientBrush",
	//   params: {guid: "MYB7", colors: ["rgba(112,128,144,1)", "rgba(192,192,192,0.5)", "rgba(112,128,144,1)"] }
	// }

];

// Get svg for brush
export const getBrushSvg = (brush: BrushType) => {
	let brushSvg = '';
	switch (brush.name) {
		case 'LinearGradientBrush': {
			brushSvg = `<linearGradient id="${brush.params.guid}" x1="0%" y1="0%" x2="100%" y2="0%">`;
			for (const [index, color] of (brush.params as GradientBrushPropType).colors.entries()) {
				brushSvg += `<stop offset="${(index / ((brush.params as GradientBrushPropType).colors.length - 1)) * 100}%" stop-color="${color}" stop-opacity="1" />`;
			}

			brushSvg += '</linearGradient>';
			break;
		}

		case 'RadialGradientBrush': {
			brushSvg = `<radialGradient id="${brush.params.guid}" cx="0.5" cy="0.5" r="0.5">`;
			for (const [index, color] of (brush.params as GradientBrushPropType).colors.entries()) {
				brushSvg += `<stop offset="${(index / ((brush.params as GradientBrushPropType).colors.length - 1)) * 100}%" stop-color="${color}" stop-opacity="1" />`;
			}

			brushSvg += '</radialGradient>';
			break;
		}

		case 'PatternBrush': {
			brushSvg = `<pattern id="${brush.params.guid}" x="0" y="0" width="50" height="50"><image href="${(brush.params as PatternBrushPropType).pattern}" x="0" y="0" width="200" height="200" /></pattern>`;
			break;
		}

		default: {
			break;
		}
	}

	return brushSvg;
};
