import elevations from '@u/elevation';
import {MY_BLACK} from '@u/types';
import {useState} from 'react';
import {View, Text, Pressable} from 'react-native';

const MyToggleButton = (properties: {values: string[]; initialValue: string; onClick: (value: string) => void}) => {
	const [selected, setSelected] = useState(properties.initialValue || properties.values[0]);
	const handleOnPress = (value: string) => {
		setSelected(value);
		properties.onClick(value);
	};

	return (
		<View style={{
			flexDirection: 'row',
			borderRadius: 25,
			height: 30,
			width: 120,
		}}>
			{properties.values.map((value, index) => (
				<Pressable
					key={value}
					onPress={() => {
						handleOnPress(value);
					}}
					style={{
						width: 60,
						alignContent: 'center',
						justifyContent: 'center',
						backgroundColor: selected === value ? '#8432ff' : 'rgba(150,150,250, 0.8)',
						borderWidth: 0.7,
						borderColor: 'rgba(0,0,0,0.5)',
						// ...elevations[5],
						...(index === 0
							? {
								borderTopLeftRadius: 25,
								borderBottomLeftRadius: 25,
							}
							:							{
								borderTopRightRadius: 25,
								borderBottomRightRadius: 25,
							}
						),
					}}
				>
					<Text style={{
						alignSelf: 'center',
						color: selected === value ? '#ffffff' : MY_BLACK,
					}}>
						{value}
					</Text>
				</Pressable>
			))}
		</View>
	);
};

export default MyToggleButton;
