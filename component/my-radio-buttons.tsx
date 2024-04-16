// RadioButtons.tsx
import React, {useState} from 'react';
import {
	type StyleProp, type TextStyle, FlatList, View,
} from 'react-native';
import MyCheckBox from './my-check-box';
import {type MyIconStyle} from './my-icon';

type RadioButtonsProperties = {
	labels: any[];
	values?: any[];
	initialValue?: any;
	onChange: (newValue: any) => void;
	textStyle?: StyleProp<TextStyle>;
	iconStyle?: MyIconStyle;
	numOfColumns?: number;
};

const RadioButtons: React.FC<RadioButtonsProperties> = ({labels, values, initialValue, onChange, textStyle, iconStyle, numOfColumns: numberOfColumns = 1}) => {
	if (new Set(labels).size !== labels.length) {
		throw new Error('Labels must be unique');
	}

	if (values && new Set(values).size !== values.length) {
		throw new Error('Values must be unique');
	}

	if (values && labels.length !== values.length) {
		throw new Error('Labels and values must have the same length');
	}

	if (!values || values === undefined || values.length === 0) {
		values = labels;
	}

	const [selected, setSelected] = useState(initialValue || values[0] || labels[0]);

	const handlePress = (value: any) => {
		setSelected(value);
		onChange(value);
	};

	return (
		<FlatList
			data={labels}
			renderItem={({item: label}) => {
				const value = (values?.[labels.indexOf(label)]) || label;
				return (
					<View style={{width: `${100 / numberOfColumns}%`}}>
						<MyCheckBox
							key={value}
							label={label}
							checked={value === selected}
							onChange={() => {
								handlePress(value);
							}}
							textStyle={textStyle}
							iconStyle={iconStyle}
							checkBoxFirst={true}
						/>
					</View>
				);
			}}
			keyExtractor={item => values?.[labels.indexOf(item)] || labels.indexOf(item).toString()}
			numColumns={numberOfColumns}
		/>
	);
};

export default RadioButtons;
