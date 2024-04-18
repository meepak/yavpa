import React, {useState} from 'react';
import {
	Text, View, StyleSheet, Pressable,
} from 'react-native';
import {BLUE_BUTTON_WIDTH} from '@u/types';
import elevations from '@u/elevation';
import MyIcon from './my-icon';

const SIZE = BLUE_BUTTON_WIDTH / 2;

type MyBlueButtonProperties = {
	icon?: {desc: string; name: string; size: number};
	text?: () => React.ReactNode;
	onPress: () => void;
	top?: number;
	bottom?: number;
	aligned?: 'left' | 'right';
};

const MyBlueButton = ({icon, text, onPress, top, bottom, aligned}: MyBlueButtonProperties) => {
	const [isPressed, setIsPressed] = useState(false);

	const buttonRadiusStyle = {
		borderTopRightRadius: aligned === 'left' ? SIZE / 2 : 0,
		borderBottomRightRadius: aligned === 'left' ? SIZE / 2 : 0,
		borderTopLeftRadius: aligned === 'right' ? SIZE / 2 : 0,
		borderBottomLeftRadius: aligned === 'right' ? SIZE / 2 : 0,
	};

	const styles = StyleSheet.create({
		buttonWrapper: {
			position: 'absolute',
			justifyContent: 'center',
			alignItems: 'center',
			...elevations[10],
			zIndex: 9999,
		},
		buttonContent: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			paddingLeft: aligned === 'right' ? (isPressed ? 27 : 20) : 20,
			paddingRight: aligned === 'left' ? (isPressed ? 27 : 20) : 20,
			opacity: isPressed ? 0.5 : 1,
		},
		text: {
			color: '#FFFFFF',
			fontSize: 10,
			fontWeight: '300',
			textAlign: 'right',
			paddingRight: 5,
		},
		buttonBase: {
			backgroundColor: isPressed ? '#030d47' : '#030f54', // Solid background color
			width: isPressed ? SIZE * 2 - 2 : SIZE * 2,
			height: SIZE - 4,
			justifyContent: 'center',
			alignItems: 'center',
			borderWidth: 0,
			...buttonRadiusStyle,
		},
	});

	// Adjustments for alignment and pressed effect
	const dynamicStyles = {
		...(aligned === 'left' ? {left: 0} : {right: 0}),
		top,
		bottom,
		borderColor: isPressed ? '#00145a' : '#030d47', // Darker border when pressed

		...buttonRadiusStyle,
		borderRightWidth: aligned === 'left' ? (isPressed ? 1 : 2) : 0,
		borderLeftWidth: aligned === 'right' ? (isPressed ? 1 : 2) : 0,
		borderTopWidth: (isPressed ? 0 : 1),
		borderBottomWidth: (isPressed ? 0 : 1),

	};

	return (
		<View style={[styles.buttonWrapper, dynamicStyles]}>
			<Pressable
				onPress={onPress}
				onPressIn={() => {
					setIsPressed(true);
				}}
				onPressOut={() => {
					setIsPressed(false);
				}}
				style={styles.buttonBase}
			>
				<View style={styles.buttonContent}>
					{icon?.desc && (
						<Text style={styles.text} numberOfLines={2}>
							{icon.desc}
						</Text>
					)}
					{icon && (
						<MyIcon
							name={icon.name}
							color='#FFFFFF'
							size={icon.size}
							activeOpacity={1}
							strokeWidth={0.8}
							style={{paddingRight: icon.desc ? 5 : 0}}
						/>
					)}
					{text?.()}
				</View>
			</Pressable>
		</View>
	);
};

export default MyBlueButton;
