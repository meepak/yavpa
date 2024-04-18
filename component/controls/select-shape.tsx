import {AvailableShapes, MY_BLACK} from '@u/types';
import MyRadioButtons from '@c/controls/my-radio-buttons';

const SelectShape = ({color = 'black', value, onValueChanged}) => {
	const handleShapeSelection = (shape: string) => {
		onValueChanged(shape);
	};

	return (
		<MyRadioButtons
			labels={AvailableShapes}
			initialValue={value}
			onChange={handleShapeSelection}
			numOfColumns={1}
			textStyle={{marginLeft: 10, marginBottom: 15}}
			iconStyle={{
				size: 24, marginBottom: 15, color: 'transparent', fill: MY_BLACK,
			}}
		/>
	);
};

export default SelectShape;
