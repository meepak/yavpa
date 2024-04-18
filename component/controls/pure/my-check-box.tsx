import {
	TouchableOpacity,
	Text,
	View,
	type TextStyle,
	type StyleProp,
} from 'react-native';
import React from 'react';
import MyIcon, {type MyIconStyle} from './my-icon';

const UNCHECKED_ICON_NAME = 'checkbox-empty';
const CHECKED_ICON_NAME = 'checkbox-checked';
const getIconName = (checked: boolean) => (checked ? CHECKED_ICON_NAME : UNCHECKED_ICON_NAME);

type MyCheckBoxProperties = {
	label: any;
	checked: boolean;
	onChange: (checked: boolean) => void;
	textStyle?: StyleProp<TextStyle>;
	iconStyle?: MyIconStyle;
	checkBoxFirst?: boolean;
};

const MyCheckBox: React.FC<MyCheckBoxProperties> = ({label, checked, onChange, textStyle, iconStyle, checkBoxFirst = false}) => {
	const handlePress = () => {
		onChange(!checked);
	};

	const elements = [
		<MyIcon key='icon' name={getIconName(checked)} style={iconStyle}/>,
	];
	if (typeof label === 'string') {
		elements.push(<Text key='label' style={textStyle}>{label}</Text>);
	} else {
		elements.push(<View key='label'>{label}</View>);
	}

	return (
		<TouchableOpacity onPress={handlePress}>
			<View style={{flexDirection: 'row', alignItems: 'center'}}>
				{checkBoxFirst ? elements : elements.reverse()}
			</View>
		</TouchableOpacity>
	);
};

export default MyCheckBox;
