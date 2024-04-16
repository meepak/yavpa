
import {View, Text} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import simplify from 'simplify-js';
import MySlider from '@c/my-slider';
import React, {useEffect, useState} from 'react';
import * as d3 from 'd3';
import {
	createPathdata, getPathFromPoints, getPointsFromPath, getViewBoxTrimmed,
} from '@u/helper';
import MyRadioButtons from '@c/my-radio-buttons';
import {getD3CurveBasis} from '@u/shapes';
import {DEFAULT_STROKE_WIDTH, MY_BLACK} from '@u/types';

// Define a fixed set of points for the polyline
// Function to generate points that form a circle
const generateCirclePoints = (radius: number, numberPoints: number) => {
	const points: Array<{x: number; y: number}> = [];
	for (let i = 0; i < numberPoints; i++) {
		const angle = (i / numberPoints) * 2 * Math.PI;
		points.push({
			x: radius * Math.cos(angle) + radius,
			y: radius * Math.sin(angle) + radius,
		});
	}

	return points;
};

const D3VALUES = [
	{key: 'smart', label: 'Smooth freehand lines only'},
	{key: 'none', label: 'Never smoothing'},
	{key: 'linear', label: 'Discreet Lines'},
	{key: 'auto', label: 'Always auto smoothing'},
	{key: 'open', label: 'Auto smoothing with end open'},
	{key: 'closed', label: 'Auto smoothing with end closed'},
];

// A test hand drawn path
const testPath = 'M93.359,304.529L93.552,287.557L95.758,277.656L97.871,268.382L99.379,260.199L101.184'
    + ',248.161L102.794,234.377L104.602,219.092L105.907,204.869L107.414,190.866L109.321'
    + ',179.217L111.329,170.161L113.338,162.185L115.348,155.717L116.632,150.855L117.66'
    + ',147.056L118.361,144.174L119.081,141.886L119.676,140.608L119.877,140.177L119.877'
    + ',140.177L119.877,140.177L119.877,140.177L120.051,140.767L120.48,142.224L121.283'
    + ',144.055L123.404,148.603L124.322,151.235L125.391,154.406L126.277,157.482L127.381'
    + ',161.405L128.288,166.18L129.307,172.632L129.718,178.478L130.017,184.471L130.223'
    + ',190.51L130.223,196.367L130.522,201.742L131.02,207.742L131.726,213.815L132.828'
    + ',219.405L133.706,224.244L134.793,228.075L136.188,231.52L137.68,235.004L139.383'
    + ',238.873L141.758,244.009L143.85,248.617L146.446,253.488L149.359,258.227L151.989'
    + ',262.966L154.355,268.146L157.008,273.891L159.35,279.061L161.419,283.542L162.813'
    + ',286.532L164.084,288.493L165.078,289.559L165.982,289.882L166.786,289.559L167.439'
    + ',289.451L167.79,289.343L168.092,289.451L168.004,289.264L166.706,286.825L161.301'
    + ',275.319L154.862,261.085L149.934,251.795L146.68,246.925L143.985,242.695L141.263'
    + ',238.82L138.194,234.133L133.477,225.905L128.339,214.972L123.616,208.059L119.85'
    + ',204.094L115.859,201.298L112.746,199.628L105.17,197.057L99.319,195.78L92.287'
    + ',194.679L85.258,195.103L78.227,196.818L72.097,199.398L65.567,203.271L61.646'
    + ',207.23L58.956,212.189L56.506,219.626L55.594,226.521L55.991,232.555L57.765'
    + ',237.669L60.443,242.205L63.674,246.594L68.498,251.095L73.486,254.925L79.693'
    + ',258.652L85.309,260.772L90.383,261.233L96.532,258.93L103.47,253.511L109.8'
    + ',245.339L116.632,237.145L123.959,228.964L133.086,218.209L144.031,206.577L152.878'
    + ',196.021L161.621,186.745L170.267,178.765L176.898,174.017L182.598,170.797L187.395'
    + ',168.474L191.158,167.398L193.943,166.887L196.166,166.995L197.522,167.641L197.974'
    + ',169.472L198.025,172.389L197.924,175.944';

const testPoints = getPointsFromPath(testPath);

// Const pathData = {...createPathdata(), path: testPath};
// const trimmedViewBox = getViewBoxTrimmed([pathData]);
const viewBox = '36 120 182 205';

const SimplifySmooth = ({
	simplifyValue,
	onSimplifyValueChanged,
	d3Value,
	onD3ValueChanged,
}) => {
	const [currentSimplify, setCurrentSimplify] = useState(simplifyValue);
	const [currentD3, setCurrentD3Value] = useState(d3Value);
	const [smoothPoints, setSmoothPoints] = useState('');

	useEffect(() => {
		const simplifiedPoints = simplify(testPoints, currentSimplify);

		if (onSimplifyValueChanged) {
			onSimplifyValueChanged(currentSimplify);
		}

		const curveBasis = getD3CurveBasis(currentD3, false);

		if (curveBasis) {
			const line = d3.line().curve(curveBasis);
			const spoints = line(simplifiedPoints.map(p => [p.x, p.y])) || '';

			setSmoothPoints(() => spoints);

			if (onD3ValueChanged) {
				onD3ValueChanged(currentD3);
			}
		} else {
			setSmoothPoints(getPathFromPoints(simplifiedPoints));
		}
	}, [currentSimplify, currentD3]);

	return (
		<View style={{flex: 1}}>

			<View style={{
				flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 55,
			}}>
				<MyRadioButtons
					labels={D3VALUES.map(value => value.label)}
					initialValue={D3VALUES.find(value => value.key === currentD3)?.label}
					onChange={label => {
						const value = D3VALUES.find(value => value.label === label)?.key;
						setCurrentD3Value(value);
						onD3ValueChanged(value);
					}}
					textStyle={{marginLeft: 5, marginBottom: 12}}
					iconStyle={{
						size: 20, color: MY_BLACK, strokeWidth: 2, marginBottom: 10,
					}}
				/>
			</View>
			<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
				<MySlider
					name='Simplify Tolerance'
					// Style={{ width: 250, height: 40 }}
					minimumValue={0}
					maximumValue={7}
					step={0.01}
					value={simplifyValue}
					horizontal={true}
					onValueChange={value => {
						setCurrentSimplify(value);
						onSimplifyValueChanged(value);
					}}
				/>
			</View>
			<View style={{
				width: 100, height: 150, position: 'absolute', top: -5, right: -20,
			}}>
				<Svg height={'100%'} width='100%' viewBox={viewBox}>
					<Path
						d={smoothPoints}
						fill='none'
						stroke='#27f0f7'
						strokeWidth={DEFAULT_STROKE_WIDTH}
					/>
				</Svg>
			</View>
			<View style={{
				width: 100, height: 150, position: 'absolute', top: -5, right: 40,
			}}>
				<Svg height='100%' width='100%' viewBox={viewBox}>
					<Path
						d={getPathFromPoints(testPoints)}
						fill='none'
						stroke='#27f0f7'
						strokeWidth={DEFAULT_STROKE_WIDTH}
						opacity={0.5}
					/>
				</Svg>
			</View>
		</View>
	);
};

export default SimplifySmooth;
