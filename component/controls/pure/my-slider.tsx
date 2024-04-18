import React, {useEffect, useRef, useState} from 'react';
import {View, Text} from 'react-native';
import Slider, {type SliderProps} from '@react-native-community/slider';
import {debounce} from 'lodash';
import {MY_BLACK} from '@u/types';
import {precise} from '@u/helper';
import MyIcon from './my-icon';
import myConsole from './my-console-log';

type MySliderProperties = {
	name: string;
	suffix?: string;
	horizontal?: boolean;
	plusMinusButtons?: boolean;
} & SliderProps;

const MySlider = (properties: MySliderProperties) => {
	const [value, setValue] = useState(properties.value);
	const valueReference = useRef(value);

	useEffect(() => {
		valueReference.current = value;
		// MyConsole.log('value is et', value)
	}, [value]);

	const showIconButton = properties.plusMinusButtons !== false;

	const processValueChange = (newValue: number) => {
		setValue(newValue);
		// ValueRef.current = newValue;
		if (properties.onValueChange) {
			properties.onValueChange(newValue);
		}
	};

	const handleValueChange = (delta: number) => {
		processValueChange((valueReference.current ?? 1) + delta);
	};

	return (
		<><View style={{
			width: properties.horizontal ? 270 : 330,
			...(!properties.horizontal && {
				transform: [
					{translateX: -135},
					{rotate: '-90deg'},
					{translateX: -150},
				],
			}),
			alignContent: 'center',
			justifyContent: 'center',
		}}>
			<Text style={{fontWeight: 'bold', alignSelf: 'center'}}>{properties.name}</Text>
			<Slider
				{...properties}
				tapToSeek={true}
				value={value}
				thumbImage={require('@a/slider-cap.png')}
				maximumTrackTintColor='#00FFFF'
				minimumTrackTintColor={MY_BLACK}
				onValueChange={processValueChange} />
			<Text style={{fontWeight: 'bold', alignSelf: 'center'}}>{precise(value as any)}{properties.suffix || ''}</Text>
		</View>

		{showIconButton
        && <>
        	<View style={{
        		position: 'absolute',
        		bottom: properties.horizontal ? -10 : -20,
        		left: properties.horizontal ? 5 : -10,
        		width: 30,
        		height: 30,
        	}}>
        		<MyIcon
        			name='minus-circle'
        			size={28}
        			fill={MY_BLACK}
        			strokeWidth={0.5}
        			// OnPress={() => debouncedChange((value ?? 0) - 1)}
        			// onPressIn={() => startInterval(-1 * (props.step || 1))}
        			onPressOut={() => {
        				handleValueChange(-1 * (properties.step || 1));
        			}}
        			color={MY_BLACK}
        		/>
        	</View>

        	<View style={{
        		position: 'absolute',
        		bottom: properties.horizontal ? -10 : -20,
        		right: properties.horizontal ? 0 : -30,
        		width: 30,
        		height: 30,

        	}}>
        		<MyIcon
        			name='plus-circle'
        			size={28}
        			fill={MY_BLACK}
        			strokeWidth={0.5}
        			// OnPress={() => debouncedChange((value  ?? 0) + 1)}
        			// onPressIn={() => startInterval(1 * (props.step || 1))}
        			onPressOut={() => {
        				handleValueChange(Number(properties.step || 1));
        			}}
        			color={MY_BLACK}

        		/>
        	</View></>
		}
		</>
	);
};

export default MySlider;
