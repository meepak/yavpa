import {useEffect, useState} from 'react';
import {View} from 'react-native';
import MyColorPicker from './my-color-picker';
import SelectBrush from './select-brush';
import MyToggleButton from './pure/my-toggle-button';

const SelectBrushColor = ({value, onValueChanged}) => {
	const [currentValue, setCurrentValue] = useState(value);
	const [selectedTab, setSelectedTab] = useState(value.startsWith('url(#') ? 'Brush' : 'Color');

	useEffect(() => {
		onValueChanged(currentValue);
		setSelectedTab(currentValue.startsWith('url(#') ? 'Brush' : 'Color');
	}, [currentValue]);

	return (
		<View style={{width: 90, height: 400}}>
			<View style={{
				top: -35, width: 100, flexDirection: 'row', justifyContent: 'center',
			}}>
				<MyToggleButton
					values={['Color', 'Brush']}
					initialValue={selectedTab}
					onClick={value => {
						setSelectedTab(value);
					}}/>
			</View>
			<View style={{marginTop: 30, marginLeft: 5}}>
				{selectedTab === 'Color' && (
					<View style={{width: 140, height: 270}}>
						<MyColorPicker initialColor={currentValue} onColorSelected={(color: any) => {
							setCurrentValue(color);
						}} />
					</View>
				)}

				{selectedTab === 'Brush' && (
					<View style={{
						top: -40, marginLeft: -7, width: 110, height: 420,
					}}>
						<SelectBrush value={currentValue} onValueChanged={guid => {
							setCurrentValue('url(#' + guid + ')');
						}} />
					</View>
				)}
			</View>
		</View>
	);
};

export default SelectBrushColor;
