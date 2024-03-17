import { AvailableShapes } from "@u/types";
import MyRadioButtons from '@c/my-radio-buttons';

const SelectShape = ({ color = 'black', value, onValueChanged }) => {

    const handleShapeSelection = (shape: string) => {
        onValueChanged(shape);
    };

    return (
        <MyRadioButtons
            labels={AvailableShapes}
            initialValue={value}
            onChange={handleShapeSelection}
            numOfColumns={1}
            textStyle={{ marginLeft: 10, marginBottom: 15 }}
            iconStyle={{ size: 20, marginBottom: 15, color: '#120e31' }}
        />
    )
}

export default SelectShape